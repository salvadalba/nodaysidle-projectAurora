-- Aurora Database Schema
-- Migration: 001_initial_schema.up.sql
-- Description: Create core tables for Aurora spatial dashboard
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
-- =============================================================================
-- USER PREFERENCES TABLE
-- =============================================================================
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_blur_intensity INTEGER DEFAULT 50 CHECK (
        max_blur_intensity >= 0
        AND max_blur_intensity <= 100
    ),
    performance_mode VARCHAR(20) DEFAULT 'auto' CHECK (
        performance_mode IN ('auto', 'performance', 'quality')
    ),
    theme VARCHAR(20) DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    default_dashboard_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
-- =============================================================================
-- DASHBOARDS TABLE
-- =============================================================================
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_dashboards_user_id ON dashboards(user_id);
-- Add foreign key constraint for default_dashboard_id after dashboards table exists
ALTER TABLE user_preferences
ADD CONSTRAINT fk_default_dashboard FOREIGN KEY (default_dashboard_id) REFERENCES dashboards(id) ON DELETE
SET NULL;
-- =============================================================================
-- LAYERS TABLE
-- =============================================================================
CREATE TABLE layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    z_index INTEGER NOT NULL CHECK (
        z_index >= 0
        AND z_index <= 100
    ),
    name VARCHAR(255) NOT NULL,
    opacity DECIMAL(3, 2) DEFAULT 1.0 CHECK (
        opacity >= 0
        AND opacity <= 1
    ),
    blur_intensity INTEGER DEFAULT 0 CHECK (
        blur_intensity >= 0
        AND blur_intensity <= 100
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_layer_zindex_per_dashboard UNIQUE (dashboard_id, z_index)
);
CREATE INDEX idx_layers_dashboard_id ON layers(dashboard_id);
CREATE INDEX idx_layers_dashboard_zindex ON layers(dashboard_id, z_index);
-- =============================================================================
-- WIDGETS TABLE
-- =============================================================================
CREATE TABLE widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layer_id UUID NOT NULL REFERENCES layers(id) ON DELETE CASCADE,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('metric', 'chart', 'composite')),
    title VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}',
    data_source JSONB DEFAULT '{}',
    is_docked BOOLEAN DEFAULT FALSE,
    docked_layer_id UUID REFERENCES layers(id) ON DELETE
    SET NULL,
        docked_position JSONB DEFAULT '{"x": 0, "y": 0}',
        z_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_widgets_layer_id ON widgets(layer_id);
CREATE INDEX idx_widgets_dashboard_id ON widgets(dashboard_id);
CREATE INDEX idx_widgets_docked ON widgets(is_docked)
WHERE is_docked = TRUE;
-- =============================================================================
-- WIDGET DATA TABLE
-- =============================================================================
CREATE TABLE widget_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    value DECIMAL(20, 4),
    trend DECIMAL(10, 4),
    constituents JSONB DEFAULT '[]',
    historical JSONB DEFAULT '[]'
);
CREATE INDEX idx_widget_data_widget_id ON widget_data(widget_id);
CREATE INDEX idx_widget_data_widget_timestamp ON widget_data(widget_id, timestamp DESC);
-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE
UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboards_updated_at BEFORE
UPDATE ON dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_layers_updated_at BEFORE
UPDATE ON layers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_widgets_updated_at BEFORE
UPDATE ON widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();