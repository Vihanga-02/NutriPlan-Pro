
-- ==========================================
-- 1) USERS TABLE
-- ==========================================
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('user','admin')) DEFAULT 'user',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ==========================================
-- 2) USER HEALTH PROFILES
-- ==========================================
CREATE TABLE user_health_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  age             INT CHECK (age > 0),
  gender          VARCHAR(10) CHECK (gender IN ('male','female','other')),

  height_cm       NUMERIC(5,2) CHECK (height_cm > 0),
  weight_kg       NUMERIC(5,2) CHECK (weight_kg > 0),

  neck_cm         NUMERIC(5,2) CHECK (neck_cm > 0),
  waist_cm        NUMERIC(5,2) CHECK (waist_cm > 0),
  hip_cm          NUMERIC(5,2) CHECK (hip_cm > 0),

  activity_level  VARCHAR(20) CHECK (activity_level IN ('sedentary','light','moderate','active')),

  bmi             NUMERIC(5,2),
  bmr             NUMERIC(7,2),
  tdee            NUMERIC(7,2),
  body_fat_pct    NUMERIC(5,2),

  preferences     JSONB DEFAULT '{}'::jsonb,

  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON user_health_profiles(user_id);

-- ==========================================
-- Auto-update timestamp function
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON user_health_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ==========================================
-- Auto-calculate BMI
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_user_bmi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL
     AND NEW.weight_kg > 0 AND NEW.height_cm > 0 THEN
    NEW.bmi := ROUND(NEW.weight_kg / POWER((NEW.height_cm / 100), 2), 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_bmi
BEFORE INSERT OR UPDATE OF weight_kg, height_cm ON user_health_profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_user_bmi();

-- ==========================================
-- Auto-calculate Body Fat % (U.S. Navy Method)
-- ==========================================
CREATE OR REPLACE FUNCTION calculate_user_body_fat_pct()
RETURNS TRIGGER AS $$
DECLARE
  h_in NUMERIC;
  w_in NUMERIC;
  n_in NUMERIC;
  hip_in NUMERIC;
  x NUMERIC;
BEGIN
  IF NEW.height_cm IS NULL OR NEW.waist_cm IS NULL OR NEW.neck_cm IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.height_cm <= 0 OR NEW.waist_cm <= 0 OR NEW.neck_cm <= 0 THEN
    RETURN NEW;
  END IF;

  h_in := NEW.height_cm / 2.54;
  w_in := NEW.waist_cm / 2.54;
  n_in := NEW.neck_cm / 2.54;

  IF NEW.gender = 'male' THEN
    x := (w_in - n_in);
    IF x > 0 AND h_in > 0 THEN
      NEW.body_fat_pct := ROUND((86.010 * log(10, x)) - (70.041 * log(10, h_in)) + 36.76, 2);
    END IF;

  ELSIF NEW.gender = 'female' THEN
    IF NEW.hip_cm IS NULL OR NEW.hip_cm <= 0 THEN
      RETURN NEW;
    END IF;

    hip_in := NEW.hip_cm / 2.54;
    x := (w_in + hip_in - n_in);

    IF x > 0 AND h_in > 0 THEN
      NEW.body_fat_pct := ROUND((163.205 * log(10, x)) - (97.684 * log(10, h_in)) - 78.387, 2);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_body_fat
BEFORE INSERT OR UPDATE OF height_cm, waist_cm, neck_cm, hip_cm, gender ON user_health_profiles
FOR EACH ROW
EXECUTE FUNCTION calculate_user_body_fat_pct();

-- ==========================================
-- 3) FOODS TABLE
-- ==========================================
CREATE TABLE foods (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  category    VARCHAR(20) NOT NULL CHECK (category IN ('restaurant','bakery')),

  calories    NUMERIC(7,2) NOT NULL CHECK (calories >= 0),
  protein_g   NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g     NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g       NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (fat_g >= 0),

  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url   TEXT NOT NULL DEFAULT '',

  tags        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_active ON foods(is_active);

-- ==========================================
-- 4) FOOD MEAL TYPES
-- ==========================================
CREATE TABLE food_meal_types (
  food_id   INT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast','lunch','teatime','dinner')),
  PRIMARY KEY (food_id, meal_type)
);

CREATE INDEX idx_food_meal_types_meal_type ON food_meal_types(meal_type);

-- ==========================================
-- 5) MEAL PLANS
-- ==========================================
CREATE TABLE meal_plans (
  id                    SERIAL PRIMARY KEY,
  user_id               INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  goal_type             VARCHAR(10) NOT NULL CHECK (goal_type IN ('gain','lose')),
  target_weight_change  NUMERIC(4,2) NOT NULL CHECK (target_weight_change > 0 AND target_weight_change <= 2),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,

  daily_calorie_target  NUMERIC(7,2) NOT NULL CHECK (daily_calorie_target >= 0),

  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CHECK (end_date = start_date + INTERVAL '13 days')
);

CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);

-- ==========================================
-- 6) MEAL PLAN DAYS
-- ==========================================
CREATE TABLE meal_plan_days (
  id           SERIAL PRIMARY KEY,
  meal_plan_id INT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  plan_date    DATE NOT NULL,
  UNIQUE (meal_plan_id, plan_date)
);

-- ==========================================
-- 7) MEAL PLAN MEALS
-- ==========================================
CREATE TABLE meal_plan_meals (
  id               SERIAL PRIMARY KEY,
  meal_plan_day_id INT NOT NULL REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type        VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast','lunch','teatime','dinner')),

  food_id          INT NOT NULL REFERENCES foods(id),
  portion_size     NUMERIC(5,2) NOT NULL DEFAULT 1.0 CHECK (portion_size > 0),

  calories         NUMERIC(7,2) NOT NULL CHECK (calories >= 0),
  protein_g        NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
  carbs_g          NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
  fat_g            NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (fat_g >= 0)
);

CREATE INDEX idx_plan_meals_day ON meal_plan_meals(meal_plan_day_id);
CREATE INDEX idx_plan_meals_type ON meal_plan_meals(meal_type);

-- ==========================================
-- 8) MEAL TRACKING
-- ==========================================
CREATE TABLE meal_tracking (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_plan_meal_id INT NOT NULL REFERENCES meal_plan_meals(id) ON DELETE CASCADE,
  log_date          DATE NOT NULL,
  status            VARCHAR(20) NOT NULL CHECK (status IN ('eaten','missed')),
  logged_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user_id, meal_plan_meal_id)
);

CREATE INDEX idx_meal_tracking_user_date ON meal_tracking(user_id, log_date);

-- ==========================================
-- 9) EXTERNAL FOOD LOGS
-- ==========================================
CREATE TABLE external_food_logs (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date   DATE NOT NULL,
  meal_type  VARCHAR(20) CHECK (meal_type IN ('breakfast','lunch','teatime','dinner')),
  food_name  VARCHAR(150) NOT NULL,
  calories   NUMERIC(7,2) NOT NULL CHECK (calories >= 0),
  logged_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_external_logs_user_date ON external_food_logs(user_id, log_date);

-- ==========================================
-- 10) BODY MEASUREMENTS
-- ==========================================
CREATE TABLE body_measurements (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,

  weight_kg    NUMERIC(5,2) CHECK (weight_kg > 0),
  neck_cm      NUMERIC(5,2) CHECK (neck_cm > 0),
  waist_cm     NUMERIC(5,2) CHECK (waist_cm > 0),
  hip_cm       NUMERIC(5,2) CHECK (hip_cm > 0),

  body_fat_pct NUMERIC(5,2),

  notes        TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user_id, log_date)
);

CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, log_date);

-- ==========================================
-- 11) ORDERS
-- ==========================================
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  user_id          INT REFERENCES users(id) ON DELETE SET NULL,

  customer_name    VARCHAR(150) NOT NULL,
  contact_number   VARCHAR(20) NOT NULL,
  delivery_address TEXT NOT NULL,

  total_amount     NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  order_status     VARCHAR(20) NOT NULL CHECK (order_status IN ('pending','confirmed','delivered','cancelled'))
                    DEFAULT 'pending',

  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ==========================================
-- 12) ORDER ITEMS
-- ==========================================
CREATE TABLE order_items (
  id        SERIAL PRIMARY KEY,
  order_id  INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_id   INT NOT NULL REFERENCES foods(id),
  quantity  INT NOT NULL CHECK (quantity > 0),
  price     NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==========================================
-- VIEWS FOR ANALYTICS
-- ==========================================

-- View for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id,
  o.customer_name,
  o.contact_number,
  o.total_amount,
  o.order_status,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View for food inventory with meal types
CREATE OR REPLACE VIEW food_inventory AS
SELECT
  f.*,
  ARRAY_AGG(DISTINCT fmt.meal_type) as meal_types
FROM foods f
LEFT JOIN food_meal_types fmt ON f.id = fmt.food_id
GROUP BY f.id;

-- ==========================================
-- Database setup complete!
-- All data will be inserted through the application UI
-- ==========================================

-- 1) Add delivery_address to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

-- 2) Add order_type to orders table for diet plan orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) CHECK (order_type IN ('food', 'diet_plan')) DEFAULT 'food';

-- 3) Add meal_plan_id to orders table to link diet plan orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS meal_plan_id INT REFERENCES meal_plans(id) ON DELETE SET NULL;

-- Create index for order_type
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);

-- Create index for meal_plan_id
CREATE INDEX IF NOT EXISTS idx_orders_meal_plan ON orders(meal_plan_id);


ALTER TABLE users
ADD COLUMN IF NOT EXISTS contact_number VARCHAR(30);

-- Add index on meal_plan_meals for faster joins with foods table
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_food_id ON meal_plan_meals(food_id);

-- Add index on meal_plan_days for faster meal plan retrieval
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_meal_plan_id ON meal_plan_days(meal_plan_id);


-- Create a view that calculates meal prices with portion sizes
CREATE OR REPLACE VIEW meal_plan_meal_prices AS
SELECT 
  mpm.id,
  mpm.meal_plan_day_id,
  mpm.meal_type,
  mpm.food_id,
  mpm.portion_size,
  f.name as food_name,
  f.price as food_price,
  (f.price * mpm.portion_size) as meal_price,
  mpm.calories,
  mpm.protein_g,
  mpm.carbs_g,
  mpm.fat_g
FROM meal_plan_meals mpm
JOIN foods f ON mpm.food_id = f.id;


-- This function can be used to calculate total price of a meal plan
CREATE OR REPLACE FUNCTION calculate_meal_plan_total(plan_id INT)
RETURNS NUMERIC AS $$
DECLARE
  total_price NUMERIC;
BEGIN
  SELECT COALESCE(SUM(f.price * mpm.portion_size), 0)
  INTO total_price
  FROM meal_plan_meals mpm
  JOIN foods f ON mpm.food_id = f.id
  JOIN meal_plan_days mpd ON mpm.meal_plan_day_id = mpd.id
  WHERE mpd.meal_plan_id = plan_id;
  
  RETURN total_price;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- SITE SETTINGS TABLE
-- ==========================================
-- This table stores restaurant/site configuration settings
-- Only one row should exist (singleton pattern)

CREATE TABLE IF NOT EXISTS site_settings (
  id                    INT PRIMARY KEY DEFAULT 1,
  
  -- Restaurant Information
  name                  VARCHAR(150) NOT NULL DEFAULT 'NutriPlan Pro',
  email                 VARCHAR(150) NOT NULL DEFAULT 'contact@nutriplan.com',
  phone                 VARCHAR(20) NOT NULL DEFAULT '+1234567890',
  address               TEXT NOT NULL DEFAULT '123 Health Street, Wellness City',
  
  -- Delivery Settings
  delivery_radius       NUMERIC(5,2) NOT NULL DEFAULT 10.00 CHECK (delivery_radius >= 0),
  min_order_amount      NUMERIC(10,2) NOT NULL DEFAULT 15.00 CHECK (min_order_amount >= 0),
  
  -- Notification Settings
  email_orders          BOOLEAN NOT NULL DEFAULT TRUE,
  email_customers       BOOLEAN NOT NULL DEFAULT TRUE,
  sms_orders            BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Insert default settings if table is empty
INSERT INTO site_settings (id, name, email, phone, address, delivery_radius, min_order_amount, email_orders, email_customers, sms_orders)
VALUES (1, 'NutriPlan Pro', 'contact@nutriplan.com', '+1234567890', '123 Health Street, Wellness City', 10.00, 15.00, TRUE, TRUE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create index for faster retrieval (though only one row exists)
CREATE INDEX IF NOT EXISTS idx_site_settings_id ON site_settings(id);
