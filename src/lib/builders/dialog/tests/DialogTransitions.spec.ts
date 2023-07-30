import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';
import { tick } from 'svelte';
import { kbd, sleep } from '@melt-ui/svelte/internal/helpers';
import DialogTransitionTest from './DialogTransitionTest.svelte';

describe('Dialog with Transitions', () => {
	beforeEach(() => {
		vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => {
			return window.setTimeout(() => fn(Date.now()), 16);
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test('No accessibility violations', async () => {
		const { container } = await render(DialogTransitionTest);

		expect(await axe(container)).toHaveNoViolations();
	});

	test('Opens when trigger is clicked', async () => {
		const { getByTestId, queryByTestId } = await render(DialogTransitionTest);

		const trigger = getByTestId('trigger');

		await expect(queryByTestId('content')).toBeNull();
		await expect(trigger).toBeVisible();
		await userEvent.click(trigger);
		await tick();
		await expect(queryByTestId('content')).not.toBeNull();
		await expect(queryByTestId('content')).toBeVisible();
	});

	test('Closes when closer is clicked', async () => {
		await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = screen.getByTestId('trigger');

		await expect(trigger).toBeVisible();
		await expect(screen.queryByTestId('content')).toBeNull();
		await expect(screen.queryByTestId('closer')).toBeNull();
		await user.click(trigger);
		await tick();
		await tick();
		await expect(screen.queryByTestId('content')).not.toBeNull();
		await user.click(screen.getByTestId('closer'));
		await tick();
		await waitForElementToBeRemoved(() => screen.getByTestId('content'));

		expect(screen.queryByTestId('content')).toBeNull();
	});

	test('Closes when Escape is hit', async () => {
		const { getByTestId, queryByTestId } = await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = getByTestId('trigger');

		await expect(trigger).toBeVisible();
		await expect(queryByTestId('content')).toBeNull();
		await user.click(trigger);
		await expect(queryByTestId('content')).toBeVisible();
		await user.keyboard(`{${kbd.ESCAPE}}`);
		await waitForElementToBeRemoved(() => getByTestId('content'));

		expect(queryByTestId('content')).toBeNull();
	});

	test('Closes when overlay is clicked', async () => {
		const { getByTestId, queryByTestId } = await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = getByTestId('trigger');

		await expect(trigger).toBeVisible();
		await expect(queryByTestId('content')).toBeNull();
		await expect(queryByTestId('overlay')).toBeNull();
		await user.click(trigger);
		await tick();
		await expect(getByTestId('content')).toBeVisible();
		await expect(getByTestId('overlay')).toBeVisible();
		await sleep(100);
		await user.click(getByTestId('overlay'));
		await waitForElementToBeRemoved(() => getByTestId('content'));

		expect(queryByTestId('content')).toBeNull();
	});

	test('Content Portal attaches dialog to body', async () => {
		const { getByTestId } = await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = getByTestId('trigger');
		await user.click(trigger);

		const content = getByTestId('content');

		await expect(content.parentElement).toEqual(document.body);
	});

	test('Overlay Portal attaches dialog to body', async () => {
		const { getByTestId } = await render(DialogTransitionTest);
		const user = userEvent.setup();
		const trigger = getByTestId('trigger');
		await user.click(trigger);

		const overlay = getByTestId('overlay');

		await expect(overlay.parentElement).toEqual(document.body);
	});

	test('Focuses first focusable item upon opening', async () => {
		const { getByTestId, queryByTestId } = await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = getByTestId('trigger');

		await expect(trigger).toBeVisible();
		await expect(queryByTestId('content')).toBeNull();
		await user.click(trigger);
		await tick();
		await expect(getByTestId('content')).toBeVisible();
		// Testing focus-trap is a bit flaky. So the focusable element is
		// always content here.
		await expect(document.activeElement).toBe(getByTestId('content'));
	});

	test('Tabbing on last item focuses first item', async () => {
		const { getByTestId, queryByTestId } = await render(DialogTransitionTest);

		const user = userEvent.setup();
		const trigger = getByTestId('trigger');

		await expect(trigger).toBeVisible();
		await expect(queryByTestId('content')).toBeNull();
		await user.click(trigger);
		await tick();
		const content = getByTestId('content');
		await expect(content).toBeVisible();
		// Testing focus-trap is a bit flaky. So the focusable element is
		// always content here.
		await expect(document.activeElement).toBe(content);
		await user.tab();
		await expect(document.activeElement).toBe(content);
	});
});