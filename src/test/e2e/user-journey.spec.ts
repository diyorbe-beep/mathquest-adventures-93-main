/**
 * End-to-End User Journey Tests
 * Tests complete user workflows from registration to lesson completion
 */

import { test, expect } from '@playwright/test';

test.describe('MathQuest User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
  });

  test('complete user registration and first lesson', async ({ page }) => {
    // Step 1: User Registration
    await page.click('[data-testid="auth-button"]');
    await page.waitForURL('/auth');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="username-input"]', 'testuser123');
    
    await page.click('[data-testid="signup-button"]');

    // Wait for successful registration
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-profile"]')).toContainText('testuser123');

    // Step 2: Navigate to lessons
    await page.click('[data-testid="lessons-link"]');
    await page.waitForURL('/map');

    // Step 3: Select first lesson
    await page.click('[data-testid="lesson-card"]:first-child');
    await page.waitForURL(/\/lesson\/.*/);

    // Step 4: Complete lesson questions
    await expect(page.locator('[data-testid="question-container"]')).toBeVisible();
    
    // Answer first question
    await page.click('[data-testid="answer-option"]:first-child');
    await page.click('[data-testid="submit-answer"]');

    // Wait for feedback
    await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();

    // Continue through lesson (simulate answering all questions correctly)
    for (let i = 0; i < 4; i++) { // Assuming 5 questions total
      await page.click('[data-testid="next-question"]');
      await page.waitForTimeout(1000); // Brief pause for animation
      await page.click('[data-testid="answer-option"]:first-child');
      await page.click('[data-testid="submit-answer"]');
      await expect(page.locator('[data-testid="answer-feedback"]')).toBeVisible();
    }

    // Step 5: Complete lesson
    await page.click('[data-testid="complete-lesson"]');
    await expect(page.locator('[data-testid="lesson-complete"]')).toBeVisible();
    
    // Verify XP and progress
    await expect(page.locator('[data-testid="xp-earned"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-update"]')).toBeVisible();

    // Step 6: Return to dashboard
    await page.click('[data-testid="back-to-dashboard"]');
    await page.waitForURL('/dashboard');

    // Verify progress is reflected
    await expect(page.locator('[data-testid="completed-lessons"]')).toContainText('1');
    await expect(page.locator('[data-testid="user-xp"]')).toBeVisible();
  });

  test('foydalanuvchi do\'kondan narsa sotib olishi mumkin', async ({ page }) => {
    // First login (assuming user exists)
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="signin-button"]');

    await page.waitForURL('/dashboard');

    // Navigate to shop
    await page.click('[data-testid="shop-link"]');
    await page.waitForURL('/shop');

    // Select an item
    await page.click('[data-testid="shop-item"]:first-child');
    await expect(page.locator('[data-testid="item-details"]')).toBeVisible();

    // Purchase item
    await page.click('[data-testid="purchase-button"]');
    
    // Handle confirmation dialog
    await expect(page.locator('[data-testid="purchase-confirm"]')).toBeVisible();
    await page.click('[data-testid="confirm-purchase"]');

    // Verify purchase success
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-coins"]')).toBeVisible();
  });

  test('foydalanuvchi yutuqlar va reytingni ko\'rishi mumkin', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="signin-button"]');

    await page.waitForURL('/dashboard');

    // View achievements
    await page.click('[data-testid="achievements-link"]');
    await page.waitForURL('/achievements');
    
    await expect(page.locator('[data-testid="achievements-list"]')).toBeVisible();
    
    // Check if any achievements are unlocked
    const unlockedAchievements = page.locator('[data-testid="achievement-unlocked"]');
    if (await unlockedAchievements.count() > 0) {
      await expect(unlockedAchievements.first()).toBeVisible();
    }

    // View leaderboard
    await page.click('[data-testid="leaderboard-link"]');
    await page.waitForURL('/leaderboard');
    
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible();
    const leaderboardRows = page.locator('[data-testid="leaderboard-rows"]');
    await expect(await leaderboardRows.count()).toBeGreaterThan(0);
  });

  test('foydalanuvchi profil sozlamalarini yangilashi mumkin', async ({ page }) => {
    // Login
    await page.goto('/auth');
    await page.fill('[data-testid="email-input"]', 'testuser@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="signin-button"]');

    await page.waitForURL('/dashboard');

    // Navigate to profile
    await page.click('[data-testid="profile-link"]');
    await page.waitForURL('/profile');

    // Update username
    await page.click('[data-testid="edit-profile"]');
    await page.fill('[data-testid="username-input"]', 'updateduser123');
    await page.click('[data-testid="save-profile"]');

    // Verify update
    await expect(page.locator('[data-testid="profile-saved"]')).toBeVisible();
    await expect(page.locator('[data-testid="username-display"]')).toContainText('updateduser123');
  });

  test('xatoliklarni qayta ishlash va validatsiya', async ({ page }) => {
    // Test invalid registration
    await page.goto('/auth');
    
    // Try to register with invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="username-input"]', 'testuser');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

    // Try to register with weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Try to register with invalid username
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="username-input"]', 'ab');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[data-testid="username-error"]')).toBeVisible();

    // Test invalid login
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="signin-button"]');

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('mobil qurilmalarda moslashuvchan dizayn ishlaydi', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Test navigation
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Test that content is still accessible
    await page.click('[data-testid="mobile-menu-item"]:first-child');
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
  });

  test('kirish imkoniyatlari xususiyatlari ishlaydi', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test ARIA labels
    const ariaElements = page.locator('[aria-label]');
    await expect(await ariaElements.count()).toBeGreaterThan(0);
    
    // Test screen reader support
    const buttons = page.locator('button');
    await expect(buttons.first()).toHaveAttribute('aria-label');
  });

  test('ishlash va yuklash holatlari', async ({ page }) => {
    // Monitor loading states
    await page.goto('/dashboard');
    
    // Check for loading indicators
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 5000 });
    
    // Test that content loads properly
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
    
    // Test navigation performance
    const startTime = Date.now();
    await page.click('[data-testid="lessons-link"]');
    await page.waitForURL('/map');
    const loadTime = Date.now() - startTime;
    
    // Navigation should be fast (< 2 seconds)
    expect(loadTime).toBeLessThan(2000);
  });
});
