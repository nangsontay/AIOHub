import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

jest.useFakeTimers();

let tree: ReactTestRenderer.ReactTestRenderer;

const directTexts = (node: ReactTestRenderer.ReactTestInstance) =>
  node
    .findAll(child => typeof child.children[0] === 'string', { deep: false })
    .map(child => child.children[0] as string);

const pressables = (label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      (node.props.accessibilityLabel === label ||
        directTexts(node).includes(label)),
  );

const press = async (label: string) => {
  const hits = pressables(label).filter(
    node => node.props.accessibilityRole === 'button',
  );
  const button = hits[hits.length - 1];
  if (!button) throw new Error('No button labelled: ' + label);
  await ReactTestRenderer.act(async () => {
    button.props.onPress();
  });
};

const demoSignIn = async () => {
  await press('Demo controls');
  await press('Use selected demo account');
};

const type = (label: string, text: string) =>
  ReactTestRenderer.act(async () => {
    const fields = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onChangeText === 'function',
    );
    fields[fields.length - 1].props.onChangeText(text);
  });

const renderApp = async () => {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(async () => {});
};

const texts = () =>
  tree.root
    .findAll(node => typeof node.children[0] === 'string')
    .map(node => node.children[0] as string);

const hasText = (text: string) => texts().includes(text);

const browserCount = () =>
  tree.root.findAll(node => typeof node.props.sourceUrl === 'string').length;

const showsServiceList = (service: string) => {
  // The provider page's service bar repeats the service name, so prove the
  // category screen is shown: its service-row button exists and no provider
  // content (browser or simulated player) is rendered.
  expect(
    pressables(service).filter(
      node => node.props.accessibilityRole === 'button',
    ).length,
  ).toBeGreaterThan(0);
  expect(browserCount()).toBe(0);
  expect(hasText('Simulated playback')).toBe(false);
};

const fieldValue = (label: string) => {
  const fields = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onChangeText === 'function',
  );
  return fields[fields.length - 1]?.props.value;
};

const unmount = () =>
  ReactTestRenderer.act(async () => {
    tree.unmount();
  });

let hardwareBack:
  | ((event: { type: string; timeStamp: number }) => boolean | undefined)
  | undefined;

beforeAll(() => {
  jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_name, handler) => {
      hardwareBack = handler;
      return { remove: () => {} };
    });
});

const pressHardwareBack = async () => {
  let handled: boolean | undefined;
  await ReactTestRenderer.act(async () => {
    if (!hardwareBack) throw new Error('hardware back listener missing');
    handled = hardwareBack({ type: 'hardwareBackPress', timeStamp: 0 });
  });
  return handled;
};

beforeEach(() => {
  require('@react-native-async-storage/async-storage').clear();
});

test('demo sign-in reaches the hub with the four category tiles', async () => {
  await renderApp();
  await demoSignIn();
  expect(hasText('Your hub')).toBe(true);
  for (const cat of ['Video', 'Music', 'News', 'Game']) {
    const tile = pressables(cat).find(
      node => node.props.accessibilityRole === 'button',
    );
    expect(tile).toBeDefined();
    expect(hasText(cat)).toBe(true);
  }
  await unmount();
});

test('News and Game open VnExpress and 2048 in the browser after the 450 ms load', async () => {
  await renderApp();
  await demoSignIn();
  await press('News');
  await press('VnExpress');
  expect(hasText('Opening VnExpress…')).toBe(true);
  expect(
    tree.root.findAllByProps({ sourceUrl: 'https://vnexpress.net/' }).length,
  ).toBe(0);
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(
    tree.root.findByProps({ sourceUrl: 'https://vnexpress.net/' }),
  ).toBeDefined();
  await press('Services');
  showsServiceList('VnExpress');
  await press('Home');
  expect(hasText('Your hub')).toBe(true);

  await press('Game');
  await press('2048');
  expect(hasText('Opening 2048…')).toBe(true);
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(
    tree.root.findByProps({ sourceUrl: 'https://play2048.co/' }),
  ).toBeDefined();
  await press('Services');
  showsServiceList('2048');
  await unmount();
});

test('Video and Music open the simulated player, and Services returns to the service list', async () => {
  await renderApp();
  await demoSignIn();
  const cases = [
    ['Video', 'YouTube', 'Videos', 'Saigon after the rain'],
    ['Music', 'Spotify', 'Tracks', 'Violet Hours'],
  ] as const;
  for (const [cat, service, listTitle, first] of cases) {
    await press(cat);
    await press(service);
    expect(hasText('Opening ' + service + '…')).toBe(true);
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(hasText('Simulated playback')).toBe(true);
    expect(hasText(first)).toBe(true);
    await press('Play');
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(hasText('0:03')).toBe(true);
    await press('Services');
    showsServiceList(service);
    expect(hasText(listTitle)).toBe(false);
    await press('Home');
  }
  expect(hasText('Your hub')).toBe(true);
  await unmount();
});

test('registering a local account, signing in, wrong password, and logout', async () => {
  await renderApp();
  await press('Sign in');
  await press('Create account');
  await type('Email', 'Sam@example.test');
  await type('Password', 'correct horse');
  await type('Confirm password', 'correct horse');
  await press('Create account');
  expect(hasText('Account created. Sign in to open your hub.')).toBe(true);
  await type('Email', 'sam@example.test');
  await type('Password', 'wrong');
  await press('Sign in');
  expect(hasText('Email or password is incorrect. Please try again.')).toBe(
    true,
  );
  await type('Password', 'correct horse');
  await press('Sign in');
  expect(hasText('Your hub')).toBe(true);
  await press('Account menu');
  expect(hasText('sam@example.test')).toBe(true);
  await press('Log out');
  expect(hasText('Sign in to your AIOHub account on Device 1.')).toBe(true);
  expect(hasText('Your hub')).toBe(false);
  await unmount();
});

test('an email with no local part is rejected on register', async () => {
  await renderApp();
  await press('Create account');
  await type('Email', '@@a.bc');
  await type('Password', 'pw123');
  await type('Confirm password', 'pw123');
  await press('Create account');
  expect(hasText('Enter a valid email address.')).toBe(true);
  expect(hasText('Account created. Sign in to open your hub.')).toBe(false);
  await unmount();
});

test('while offline, Back from the service list shows the offline card, not the service', async () => {
  await renderApp();
  await demoSignIn();
  await press('News');
  await press('VnExpress');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(browserCount()).toBe(1);
  await press('Services');
  await press('Demo controls');
  await press('Go offline');
  await pressHardwareBack();
  expect(hasText('Couldn’t load VnExpress')).toBe(true);
  expect(browserCount()).toBe(0);
  expect(hasText('Simulated playback')).toBe(false);
  await unmount();
});

test('going offline on a ready service page shows the offline card', async () => {
  await renderApp();
  await demoSignIn();
  await press('Video');
  await press('YouTube');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('Simulated playback')).toBe(true);
  await press('Demo controls');
  await press('Go offline');
  expect(hasText('Couldn’t load YouTube')).toBe(true);
  expect(hasText('Simulated playback')).toBe(false);
  expect(browserCount()).toBe(0);
  await unmount();
});

test('News shows the provider account row below the browser', async () => {
  await renderApp();
  await demoSignIn();
  const cases = [['News', 'VnExpress', 'https://vnexpress.net/']] as const;
  for (const [cat, service, url] of cases) {
    await press(cat);
    await press(service);
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(browserCount()).toBe(1);
    expect(hasText('Provider account · Guest')).toBe(true);
    expect(
      pressables('Provider sign-in').filter(
        node => node.props.accessibilityRole === 'button',
      ).length,
    ).toBeGreaterThan(0);
    const flat = tree.root.findAll(() => true);
    const browserAt = flat.findIndex(node => node.props.sourceUrl === url);
    const rowAt = flat.findIndex(
      node => node.children[0] === 'Provider account · Guest',
    );
    expect(browserAt).toBeGreaterThanOrEqual(0);
    expect(rowAt).toBeGreaterThan(browserAt);
    await press('Services');
    await press('Home');
  }
  await unmount();
});

test('Device 2 restore shows the Device 1 provider identity', async () => {
  await renderApp();
  await demoSignIn();
  await press('Demo controls');
  await press('Prepare a sample Device 1 session');
  expect(hasText('Prepared VnExpress for Avery on Device 1.')).toBe(true);
  await press('Start fresh on Device 2');
  expect(
    hasText('Device 2 is ready. Sign in with the same AIOHub account.'),
  ).toBe(true);
  await demoSignIn();
  await press('Simulated restoration');
  await press('Restore service sessions');
  expect(hasText('Restoring your eligible Device 1 sessions…')).toBe(true);
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(850);
  });
  expect(
    hasText(
      'Restored. Open the service to see your Device 1 provider identity.',
    ),
  ).toBe(true);
  await press('Open restored service');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('Provider account')).toBe(true);
  expect(hasText('Avery · VnExpress')).toBe(true);
  await unmount();
});

test('empty sign-in submit shows the email and password errors', async () => {
  await renderApp();
  await press('Sign in');
  await press('Sign in');
  expect(hasText('Enter a valid email address.')).toBe(true);
  expect(hasText('Enter a password.')).toBe(true);
  await unmount();
});

test('starting fresh on Device 2 clears the typed email and the auth error', async () => {
  await renderApp();
  await press('Sign in');
  await type('Email', 'x@y.zz');
  await type('Password', 'wrong');
  await press('Sign in');
  expect(hasText('Email or password is incorrect. Please try again.')).toBe(
    true,
  );
  await press('Demo controls');
  await press('Start fresh on Device 2');
  expect(fieldValue('Email')).toBe('');
  expect(hasText('Email or password is incorrect. Please try again.')).toBe(
    false,
  );
  expect(
    hasText('Device 2 is ready. Sign in with the same AIOHub account.'),
  ).toBe(true);
  await unmount();
});

test('guest mode lists services and opens the selected service', async () => {
  await renderApp();
  await press('Get started');
  expect(hasText('Browsing as a guest. Choose a service to open.')).toBe(true);
  expect(pressables('Guest menu').length).toBeGreaterThan(0);
  const categories = {
    Video: ['YouTube', 'Vimeo', 'Twitch', 'Dailymotion'],
    Music: ['Spotify', 'SoundCloud', 'Bandcamp'],
    News: ['VnExpress', 'Tuổi Trẻ', 'Thanh Niên'],
    Game: ['2048'],
  };
  for (const [cat, services] of Object.entries(categories)) {
    await press(cat);
    for (const service of services)
      expect(
        pressables(service).filter(
          node => node.props.accessibilityRole === 'button',
        ).length,
      ).toBeGreaterThan(0);
    if (cat === 'Game') {
      expect(pressables('Tic Tac Toe')).toHaveLength(0);
      expect(pressables('Memory Match')).toHaveLength(0);
      await press('2048');
      await ReactTestRenderer.act(async () => {
        jest.advanceTimersByTime(450);
      });
      expect(browserCount()).toBe(1);
      expect(pressables('Provider sign-in')).toHaveLength(0);
      await press('Services');
    }
    await press('Home');
  }
  for (const [service, url] of [
    ['Tuổi Trẻ', 'https://tuoitre.vn/'],
    ['Thanh Niên', 'https://thanhnien.vn/'],
  ]) {
    await press('News');
    await press(service);
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(tree.root.findByProps({ sourceUrl: url })).toBeDefined();
    await press('Services');
    await press('Home');
  }
  await press('Video');
  await press('Vimeo');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('Paper Skies')).toBe(true);
  await press('Provider sign-in');
  await press('Continue as Guest · Vimeo');
  expect(hasText('Guest · Vimeo')).toBe(true);
  await press('Services');
  await press('YouTube');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('Provider account · Guest')).toBe(true);
  await unmount();
});

test('restores a non-default service and excludes games from sessions', async () => {
  await renderApp();
  await demoSignIn();
  await press('Demo controls');
  await press('Game');
  await press('Prepare a sample Device 1 session');
  expect(hasText('Games do not use provider sessions.')).toBe(true);
  expect(
    JSON.parse((await AsyncStorage.getItem('aiohub-pocket-v1'))!).sessions,
  ).toEqual({});
  await pressHardwareBack();
  await press('Video');
  await press('Vimeo');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  await press('Provider sign-in');
  await press('Continue as Avery · Vimeo');
  await press('Demo controls');
  await press('Start fresh on Device 2');
  await demoSignIn();
  await press('Simulated restoration');
  await press('Restore service sessions');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(850);
  });
  await press('Open restored service');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('Paper Skies')).toBe(true);
  expect(hasText('Avery · Vimeo')).toBe(true);
  await unmount();
});

test('guest mode persists and hardware back exits guest mode', async () => {
  await renderApp();
  await press('Get started');
  await unmount();
  await renderApp();
  expect(hasText('Browsing as a guest. Choose a service to open.')).toBe(true);
  expect(await pressHardwareBack()).toBe(true);
  expect(pressables('Get started').length).toBeGreaterThan(0);
  expect(pressables('Guest menu')).toHaveLength(0);
  expect(
    JSON.parse((await AsyncStorage.getItem('aiohub-pocket-v1'))!).guest,
  ).toBe(false);
  await unmount();
  await renderApp();
  expect(pressables('Get started').length).toBeGreaterThan(0);
  await unmount();
});

test('welcome from guest sign-in clears navigation history', async () => {
  await renderApp();
  await press('Get started');
  await press('Guest menu');
  await press('Sign in');
  await press('Welcome');
  await pressHardwareBack();
  await pressHardwareBack();
  expect(pressables('Get started').length).toBeGreaterThan(0);
  expect(hasText('Your hub')).toBe(false);
  await unmount();
});

test('hardware back exits at signed-in home', async () => {
  await renderApp();
  await demoSignIn();
  expect(await pressHardwareBack()).toBe(false);
  await unmount();
});

test('leaving guest mode clears persisted guest state and history', async () => {
  await renderApp();
  await press('Get started');
  await press('Guest menu');
  await press('Leave guest mode');
  expect(pressables('Get started').length).toBeGreaterThan(0);
  expect(await pressHardwareBack()).toBe(false);
  expect(
    JSON.parse((await AsyncStorage.getItem('aiohub-pocket-v1'))!).guest,
  ).toBe(false);
  await unmount();
});

test('hydration prefers a signed-in user over guest mode', async () => {
  await AsyncStorage.setItem(
    'aiohub-pocket-v1',
    JSON.stringify({
      accounts: {},
      sessions: {},
      device: 'D1',
      user: 'test@example.com',
      guest: true,
    }),
  );
  await renderApp();
  expect(pressables('Guest menu')).toHaveLength(0);
  expect(hasText('Your hub')).toBe(true);
  await unmount();
});
