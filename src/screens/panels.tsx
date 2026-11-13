import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, MenuRow, Notice } from '../components/ui';
import { Sheet } from '../components/sheet';
import { colors } from '../theme/tokens';
import { cats, demos, type Cat } from '../state/catalog';
import { useApp } from '../state/store';

const catList = Object.keys(cats) as Cat[];
const deviceText = (device: 'D1' | 'D2') =>
  device === 'D2' ? 'Device 2' : 'Device 1';

function DemoPanel() {
  const {
    data,
    chosenDemo,
    chooseDemo,
    demoLogin,
    demoCat,
    setDemoCat,
    offline,
    toggleOffline,
    startDevice2,
    returnDevice1,
    seedSession,
    resetDemo,
    sheetNotice,
    hold,
  } = useApp();
  return (
    <>
      {!!sheetNotice && <Notice>{sheetNotice}</Notice>}
      <Text style={styles.h3}>Account for next demo sign-in</Text>
      <View style={styles.selector}>
        {(['a', 'b'] as const).map(k => (
          <Pressable
            key={k}
            accessibilityRole="button"
            accessibilityLabel={demos[k].name + ' · ' + k.toUpperCase()}
            accessibilityState={{ selected: chosenDemo === k }}
            onPress={() => chooseDemo(k)}
            style={[
              styles.option,
              chosenDemo === k ? styles.optionActive : styles.optionSecond,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                chosenDemo === k && styles.optionTextActive,
              ]}
            >
              {demos[k].name + ' · ' + k.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <MenuRow
        label="Use selected demo account"
        icon="user"
        onPress={demoLogin}
      />
      <Text style={styles.h3}>Preview a screen state</Text>
      <Text style={styles.label}>Category</Text>
      <View style={styles.selector}>
        {catList.map(c => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityLabel={c}
            accessibilityState={{ selected: demoCat === c }}
            onPress={() => setDemoCat(c)}
            style={[
              styles.option,
              demoCat === c ? styles.optionActive : styles.optionSecond,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                demoCat === c && styles.optionTextActive,
              ]}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </View>
      <MenuRow
        label="Service loading"
        icon="video"
        onPress={() => hold('loading')}
      />
      <MenuRow
        label="Empty category"
        icon="empty"
        onPress={() => hold('empty')}
      />
      <MenuRow
        label="Page-load error"
        icon="warn"
        onPress={() => hold('error')}
      />
      <MenuRow
        label={offline ? 'Go online' : 'Go offline'}
        icon="offline"
        onPress={toggleOffline}
      />
      <Text style={styles.h3}>Devices</Text>
      <Text style={styles.hint}>
        Current device: {deviceText(data.device)}. Provider sessions belong to
        the signed-in AIOHub user.
      </Text>
      <MenuRow
        label="Start fresh on Device 2"
        icon="device"
        onPress={startDevice2}
      />
      {data.device === 'D2' && (
        <MenuRow
          label="Return to Device 1"
          icon="device"
          onPress={returnDevice1}
        />
      )}
      {data.user && (
        <MenuRow
          label="Prepare a sample Device 1 session"
          icon="user"
          onPress={seedSession}
        />
      )}
      <View style={styles.rule} />
      <MenuRow label="Reset demo" icon="reset" onPress={resetDemo} />
    </>
  );
}

function AccountPanel() {
  const { data, who, openRestore, logout, openAuthPage, leaveGuest } = useApp();
  if (data.guest)
    return (
      <>
        <Text style={styles.hint}>
          You can explore without an AIOHub account. Your game progress stays in
          this browser.
        </Text>
        <MenuRow
          label="Sign in"
          icon="user"
          onPress={() => openAuthPage('signin')}
        />
        <MenuRow
          label="Create account"
          icon="user"
          onPress={() => openAuthPage('register')}
        />
        <MenuRow label="Leave guest mode" icon="signout" onPress={leaveGuest} />
      </>
    );
  return (
    <>
      <Text style={styles.who}>{who()}</Text>
      <Text style={styles.hint}>
        {data.user} · {deviceText(data.device)}
      </Text>
      {data.device === 'D2' && (
        <MenuRow
          label="Simulated restoration"
          icon="device"
          onPress={openRestore}
        />
      )}
      <MenuRow label="Log out" icon="signout" onPress={logout} />
    </>
  );
}

function ProviderPanel() {
  const { route, data, who, providerSignIn, closePanel } = useApp();
  const service = route.page === 'provider' ? route.service : cats.News;
  return (
    <>
      <Text style={styles.sub}>
        Use a fictional provider identity for this{' '}
        {data.guest ? 'guest session' : 'AIOHub account'}.
      </Text>
      <Button
        variant="primary"
        label={'Continue as ' + who() + ' · ' + service}
        onPress={providerSignIn}
      />
      <Button variant="quiet" label="Cancel" onPress={closePanel} />
    </>
  );
}

export default function Panels() {
  const { panel, closePanel, route, data } = useApp();
  const providerService = route.page === 'provider' ? route.service : cats.News;
  if (panel === 'demo') {
    return (
      <Sheet visible title="Demo controls" onClose={closePanel}>
        <DemoPanel />
      </Sheet>
    );
  }
  if (panel === 'account') {
    return (
      <Sheet
        visible
        title={data.guest ? 'Guest mode' : 'AIOHub account'}
        onClose={closePanel}
      >
        <AccountPanel />
      </Sheet>
    );
  }
  if (panel === 'provider') {
    return (
      <Sheet
        visible
        title={providerService + ' demo sign-in'}
        onClose={closePanel}
      >
        <ProviderPanel />
      </Sheet>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  h3: { marginTop: 10, fontSize: 15, fontWeight: '700', color: colors.ink },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  sub: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  who: { fontWeight: '700', fontSize: 17, color: colors.ink },
  selector: { flexDirection: 'row', gap: 7 },
  option: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionActive: { backgroundColor: colors.tonal },
  optionSecond: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  optionText: { color: colors.indigo, fontSize: 13, fontWeight: '600' },
  optionTextActive: { fontWeight: '700' },
  rule: { height: 1, backgroundColor: colors.line, marginVertical: 6 },
});
