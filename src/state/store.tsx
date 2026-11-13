import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat, cats, demos } from './catalog';
import { digest } from './sha256';
export type { Cat } from './catalog';
export type Route =
  | { page: 'welcome' | 'signin' | 'register' | 'home' | 'restore' }
  | { page: 'category'; cat: Cat }
  | { page: 'provider'; cat: Cat; phase: 'loading' | 'ready' | 'error' };
export type PanelName = 'demo' | 'account' | 'provider' | null;
export type RestoreState =
  | ''
  | 'progress'
  | 'success'
  | 'expired'
  | 'unsupported'
  | 'missing'
  | 'offline';
export type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
  auth?: string;
};
type Data = {
  accounts: Record<string, { salt: string; hash: string }>;
  sessions: Record<string, string>;
  games: Record<string, unknown>;
  device: 'D1' | 'D2';
  user: string | null;
};
type Outcome = 'success' | 'expired' | 'unsupported';
type Held = '' | 'loading' | 'empty' | 'error';
const fresh = (): Data => ({
  accounts: {},
  sessions: {},
  games: {},
  device: 'D1',
  user: null,
});
const key = 'aiohub-pocket-v1';
function createStore(notify: () => void) {
  let ready = false,
    data = fresh(),
    route: Route = { page: 'welcome' },
    stack: Route[] = [],
    held: Held = '',
    offline = false,
    notice = '',
    sheetNotice = '',
    prefill = '',
    chosenDemo: 'a' | 'b' = 'a',
    outcome: Outcome = 'success',
    restoreState: RestoreState = '',
    panel: PanelName = null,
    demoCat: Cat = 'News';
  let timer: ReturnType<typeof setTimeout> | undefined,
    ticket = 0,
    writes = Promise.resolve();
  const update = () => notify();
  const setPanel = (name: PanelName) => {
    panel = name;
    sheetNotice = '';
  };
  const save = () => {
    const snapshot = JSON.stringify(data);
    writes = writes
      .then(() => AsyncStorage.setItem(key, snapshot))
      .catch(() => {});
  };
  const cancel = () => {
    clearTimeout(timer);
    ticket++;
  };
  const sessionKey = (cat: Cat, device = data.device) =>
    JSON.stringify([device, data.user, cat]);
  const session = (cat: Cat, device?: 'D1' | 'D2') =>
    data.sessions[sessionKey(cat, device)];
  const who = () =>
    Object.values(demos).find(d => d.email === data.user)?.name ||
    (data.user || 'Guest').split('@')[0];
  const navigate = (next: Route, replace = false) => {
    cancel();
    if (
      !data.user &&
      ['home', 'category', 'provider', 'restore'].includes(next.page)
    )
      next = { page: 'signin' };
    if (!replace) stack.push(route);
    route = next;
    update();
  };
  const back = () => {
    if (!stack.length) return false;
    cancel();
    route = stack.pop()!;
    if (
      route.page === 'provider' &&
      route.phase === 'loading' &&
      held !== 'loading'
    )
      route = { ...route, phase: offline ? 'error' : 'ready' };
    update();
    return true;
  };
  const startUser = (email: string) => {
    prefill = '';
    data.user = email;
    save();
    stack = [];
    notice = '';
    navigate({ page: 'home' }, true);
  };
  const logout = () => {
    data.user = null;
    prefill = '';
    save();
    stack = [];
    held = '';
    notice = '';
    restoreState = '';
    setPanel(null);
    navigate({ page: 'signin' }, true);
  };
  const goCategory = (cat: Cat) => {
    held = '';
    navigate({ page: 'category', cat });
  };
  const openService = (cat: Cat, sticky: '' | 'loading' | 'error' = '') => {
    held = sticky;
    navigate({ page: 'provider', cat, phase: 'loading' });
    if (route.page !== 'provider' || sticky === 'loading') return;
    const current = ticket;
    timer = setTimeout(() => {
      if (ticket !== current) return;
      route = {
        page: 'provider',
        cat,
        phase: offline || sticky === 'error' ? 'error' : 'ready',
      };
      update();
    }, 450);
  };
  const auth = async (
    emailInput: string,
    pw: string,
    confirm?: string,
  ): Promise<FieldErrors | null> => {
    const email = emailInput.trim().toLowerCase(),
      errors: FieldErrors = {},
      registering = confirm !== undefined;
    if (!/^\S+@\S+\.\S+$/.test(email))
      errors.email = 'Enter a valid email address.';
    if (!pw) errors.password = 'Enter a password.';
    if (registering) {
      if (!confirm || confirm !== pw)
        errors.confirm = 'Enter the same password in both fields.';
      if (
        Object.hasOwn(data.accounts, email) ||
        Object.values(demos).some(d => d.email === email)
      )
        errors.email = 'This email already has an account.';
    }
    if (Object.keys(errors).length) return errors;
    if (offline) return { auth: 'You are offline. Reconnect and try again.' };
    try {
      if (registering) {
        const salt = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0'),
        ).join('');
        data.accounts[email] = { salt, hash: await digest(pw, salt) };
        save();
        prefill = email;
        notice = 'Account created. Sign in to open your hub.';
        navigate({ page: 'signin' });
      } else {
        const record = data.accounts[email];
        if (!record || (await digest(pw, record.salt)) !== record.hash)
          return { auth: 'Email or password is incorrect. Please try again.' };
        startUser(email);
      }
      return null;
    } catch {
      return { auth: 'Couldn’t complete this request. Please try again.' };
    }
  };
  const api = {
    get state() {
      return {
        ready,
        data: { ...data },
        route,
        canGoBack: stack.length > 0,
        held,
        offline,
        notice,
        sheetNotice,
        prefill,
        chosenDemo,
        outcome,
        restoreState,
        panel,
        demoCat,
      };
    },
    async hydrate() {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed.accounts === 'object' &&
            typeof parsed.sessions === 'object' &&
            ['D1', 'D2'].includes(parsed.device)
          )
            data = { ...fresh(), ...parsed };
        }
      } catch {}
      route = { page: data.user ? 'home' : 'welcome' };
      ready = true;
      update();
    },
    dispose() {
      cancel();
    },
    navigate,
    back,
    openAuthPage(page: 'welcome' | 'signin' | 'register') {
      setPanel(null);
      notice = '';
      navigate({ page });
    },
    openRestore() {
      setPanel(null);
      restoreState = '';
      navigate({ page: 'restore' });
    },
    goHome() {
      held = '';
      navigate({ page: 'home' });
    },
    goCategory,
    openService,
    finishLoad() {
      if (route.page === 'provider') {
        cancel();
        held = '';
        route = { ...route, phase: offline ? 'error' : 'ready' };
        update();
      }
    },
    retry() {
      if (route.page === 'provider') openService(route.cat);
    },
    register(email: string, pw: string, confirm: string) {
      return auth(email, pw, confirm);
    },
    signIn(email: string, pw: string) {
      return auth(email, pw);
    },
    demoLogin() {
      setPanel(null);
      startUser(demos[chosenDemo].email);
    },
    logout,
    openPanel(name: PanelName) {
      setPanel(name);
      if (name === 'demo') demoCat = 'cat' in route ? route.cat : 'News';
      update();
    },
    closePanel() {
      setPanel(null);
      update();
    },
    chooseDemo(v: 'a' | 'b') {
      chosenDemo = v;
      sheetNotice = '';
      update();
    },
    setDemoCat(cat: Cat) {
      demoCat = cat;
      update();
    },
    hold(v: 'loading' | 'empty' | 'error') {
      setPanel(null);
      if (!data.user) {
        data.user = demos[chosenDemo].email;
        save();
        stack = [];
      }
      offline = false;
      if (v === 'empty') {
        held = v;
        navigate({ page: 'category', cat: demoCat });
      } else if (v === 'error') {
        held = v;
        navigate({ page: 'provider', cat: demoCat, phase: 'error' });
      } else openService(demoCat, 'loading');
    },
    toggleOffline() {
      setPanel(null);
      offline = !offline;
      if (offline && route.page === 'provider') {
        cancel();
        route = { ...route, phase: 'error' };
      }
      update();
    },
    startDevice2() {
      setPanel(null);
      data.device = 'D2';
      data.user = null;
      prefill = '';
      for (const k of Object.keys(data.sessions)) {
        try {
          if (JSON.parse(k)[0] === 'D2') delete data.sessions[k];
        } catch {}
      }
      save();
      stack = [];
      held = '';
      offline = false;
      restoreState = '';
      notice = 'Device 2 is ready. Sign in with the same AIOHub account.';
      navigate({ page: 'signin' }, true);
    },
    returnDevice1() {
      data.device = 'D1';
      offline = false;
      logout();
      notice = 'Back on Device 1.';
      update();
    },
    seedSession() {
      data.sessions[sessionKey(demoCat, 'D1')] = who() + ' · ' + cats[demoCat];
      save();
      setPanel('demo');
      sheetNotice =
        'Prepared ' + cats[demoCat] + ' for ' + who() + ' on Device 1.';
      update();
    },
    providerSignIn() {
      if (route.page === 'provider') {
        data.sessions[sessionKey(route.cat)] = who() + ' · ' + cats[route.cat];
        save();
        setPanel(null);
        update();
      }
    },
    providerSignOut() {
      if (route.page === 'provider') {
        delete data.sessions[sessionKey(route.cat)];
        save();
        setPanel(null);
        update();
      }
    },
    session,
    who,
    setOutcome(v: Outcome) {
      outcome = v;
      restoreState = '';
      update();
    },
    runRestore() {
      cancel();
      restoreState = 'progress';
      update();
      const current = ticket;
      timer = setTimeout(() => {
        if (ticket !== current) return;
        const eligible = (Object.keys(cats) as Cat[]).filter(c =>
          session(c, 'D1'),
        );
        restoreState = offline
          ? 'offline'
          : outcome === 'success'
          ? eligible.length
            ? 'success'
            : 'missing'
          : outcome;
        if (restoreState === 'success')
          eligible.forEach(c => {
            data.sessions[sessionKey(c)] = session(c, 'D1');
          });
        else if (restoreState === 'expired' || restoreState === 'unsupported')
          eligible.forEach(c => {
            delete data.sessions[sessionKey(c)];
          });
        save();
        update();
      }, 850);
    },
    restoredOpen() {
      const cat = (Object.keys(cats) as Cat[]).find(
        c => session(c, 'D1') && session(c),
      );
      if (cat) openService(cat);
    },
    restoreManual() {
      const cat =
        (Object.keys(cats) as Cat[]).find(c => session(c, 'D1')) || 'Music';
      if (offline) openService(cat);
      else {
        navigate({ page: 'provider', cat, phase: 'ready' });
        setPanel('provider');
        update();
      }
    },
    resetDemo() {
      cancel();
      data = fresh();
      save();
      stack = [];
      held = '';
      offline = false;
      outcome = 'success';
      restoreState = '';
      notice = '';
      prefill = '';
      chosenDemo = 'a';
      setPanel(null);
      navigate({ page: 'welcome' }, true);
    },
  };
  return api;
}
type Store = ReturnType<typeof createStore>;
type AppContext = Store['state'] & Omit<Store, 'state' | 'hydrate' | 'dispose'>;
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [, render] = useState(0);
  const ref = useRef<Store | null>(null);
  if (!ref.current) ref.current = createStore(() => render(n => n + 1));
  const store = ref.current;
  useEffect(() => {
    store.hydrate();
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (store.state.panel) {
        store.closePanel();
        return true;
      }
      if (store.back()) return true;
      const { data, route } = store.state;
      if (data.user || route.page === 'welcome') return false;
      store.navigate({ page: 'welcome' }, true);
      return true;
    });
    return () => {
      sub.remove();
      store.dispose();
    };
  }, [store]);
  return (
    <Context.Provider value={{ ...store, ...store.state }}>
      {children}
    </Context.Provider>
  );
}
export function useApp(): AppContext {
  const value = useContext(Context);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
