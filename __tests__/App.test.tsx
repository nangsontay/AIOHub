import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

let tree: ReactTestRenderer.ReactTestRenderer;

const press = (label: string) =>
  ReactTestRenderer.act(async () => {
    tree.root.findByProps({accessibilityLabel: label}).props.onPress();
  });

const type = (label: string, text: string) =>
  ReactTestRenderer.act(async () => {
    tree.root.findByProps({accessibilityLabel: label}).props.onChangeText(text);
  });

const renderApp = () =>
  ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

const findByText = (text: string) =>
  tree.root.findAll(
    node =>
      typeof node.children[0] === 'string' &&
      node.children[0] === text &&
      typeof node.type === 'function' &&
      node.type.name === 'Text',
  );

const hasText = (text: string) => findByText(text).length > 0;

test('demo sign-in reaches the hub with the four category tiles', async () => {
  await renderApp();
  await press('Use demo account');
  expect(hasText('Your hub')).toBe(true);
  expect(hasText('Video')).toBe(true);
  expect(hasText('Music')).toBe(true);
  expect(hasText('News')).toBe(true);
  expect(hasText('Game')).toBe(true);
  expect(tree.root.findByProps({accessibilityLabel: 'News'}).props.accessibilityState.selected).toBeUndefined();
  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('News and Game open VnExpress and 2048 in the browser after the load', async () => {
  await renderApp();
  await press('Use demo account');
  await press('News');
  await press('VnExpress');
  expect(hasText('Opening VnExpress…')).toBe(true);
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(450);
  });
  expect(hasText('https://vnexpress.net/')).toBe(false); // rendered inside the mocked browser label
  expect(
    tree.root.findByProps({sourceUrl: 'https://vnexpress.net/'}),
  ).toBeDefined();
  await press('Services');
  expect(hasText('News')).toBe(true);
  expect(hasText('VnExpress')).toBe(true);

  await press('Home');
  await press('Game');
  await press('2048');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(
    tree.root.findByProps({sourceUrl: 'https://play2048.co/'}),
  ).toBeDefined();
  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('Video and Music open the simulated player, and Services returns to the list', async () => {
  await renderApp();
  await press('Use demo account');
  for (const [cat, service, listTitle, first] of [
    ['Video', 'YouTube', 'Videos', 'Saigon after the rain'],
    ['Music', 'Spotify', 'Tracks', 'Violet Hours'],
  ] as const) {
    await press(cat);
    await press(service);
    expect(hasText('Simulated playback')).toBe(true);
    expect(hasText(first)).toBe(true);
    await press('Play');
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(450);
    });
    expect(hasText(listTitle)).toBe(true);
    await press('Services');
    expect(hasText(service)).toBe(true);
    await press('Home');
  }
  expect(hasText('Your hub')).toBe(true);
  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

test('registering a local account then signing in reaches the hub, and logout returns to sign-in', async () => {
  await renderApp();
  await press('Sign in');
  await press('Create account');
  expect(hasText('Create account')).toBe(true);
  await type('Email', 'Sam@example.test');
  await type('Password', 'correct horse');
  await type('Confirm password', 'correct horse');
  await press('Create account');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(hasText('Account created. Sign in to open your hub.')).toBe(true);
  await type('Email', 'sam@example.test');
  await type('Password', 'correct horse');
  await press('Sign in');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(hasText('Your hub')).toBe(true);

  // Wrong password shows the inline form error and stays on sign-in.
  await press('Account menu');
  await press('Log out');
  expect(hasText('Sign in')).toBe(true);
  await type('Email', 'sam@example.test');
  await type('Password', 'wrong');
  await press('Sign in');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(hasText('Email or password is incorrect. Please try again.')).toBe(
    true,
  );
  expect(hasText('Your hub')).toBe(false);
  await ReactTestRenderer.act(async () => {
    tree.unmount();
  });
});

