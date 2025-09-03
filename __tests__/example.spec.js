import { test, expect } from '@playwright/test';

test('has correct title', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page).toHaveTitle("Hexlet Frontend Project");
});

test('has RSS form elements', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Проверяем наличие input с placeholder
  await expect(page.locator('input[placeholder="ссылка RSS"]')).toBeVisible();
  
  // Проверяем кнопку по тексту "Добавить"
  await expect(page.getByText('Добавить')).toBeVisible();
  
  // Или проверяем кнопку по type="submit"
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('has example text', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Проверяем наличие примера RSS
  await expect(page.getByText('Пример: https://lorem-rss.hexlet.app/feed')).toBeVisible();
});

test('has main heading', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Проверяем главный заголовок
  await expect(page.getByText('RSS агрегатор')).toBeVisible();
});

test('has description text', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Проверяем описание
  await expect(page.getByText('Начните читать RSS сегодня! Это легко, это красиво.')).toBeVisible();
});

// Тест для проверки добавления RSS (будет работать после реализации функционала)
test.skip('can add RSS feed', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Заполняем форму
  await page.locator('input[placeholder="ссылка RSS"]').fill('https://lorem-rss.hexlet.app/feed');
  await page.locator('button[type="submit"]').click();
  
  // Этот тест нужно включить после реализации функционала
  await expect(page.getByText('RSS успешно загружен')).toBeVisible();
});