import { expect, test } from '@playwright/test';

test('adds, completes and deletes a task', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('No tienes tareas')).toBeVisible();

  const input = page.getByRole('textbox', { name: 'Nueva tarea' });
  await input.fill('Comprar café');
  await input.press('Enter');

  await expect(page.getByText('Comprar café')).toBeVisible();
  await expect(page.getByTestId('summary')).toContainText('1 pendientes');

  await page.getByText('Comprar café').click();
  await expect(page.getByTestId('summary')).toContainText('1 completadas');

  await page.getByRole('button', { name: 'Eliminar tarea' }).click();
  await expect(page.getByText('No tienes tareas')).toBeVisible();
});
