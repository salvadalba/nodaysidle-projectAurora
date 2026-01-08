-- Aurora Database Schema
-- Migration: 001_initial_schema.down.sql
-- Description: Drop all tables in reverse order
-- Drop triggers first
DROP TRIGGER IF EXISTS update_widgets_updated_at ON widgets;
DROP TRIGGER IF EXISTS update_layers_updated_at ON layers;
DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Drop tables in reverse order of creation (respecting foreign keys)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS widget_data;
DROP TABLE IF EXISTS widgets;
DROP TABLE IF EXISTS layers;
-- Remove the foreign key constraint before dropping dashboards
ALTER TABLE IF EXISTS user_preferences DROP CONSTRAINT IF EXISTS fk_default_dashboard;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS users;
-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";