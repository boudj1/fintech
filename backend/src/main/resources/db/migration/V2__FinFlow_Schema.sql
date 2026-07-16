-- FinFlow schema: financial tables + products catalog

-- Accounts (FinFlow multi-currency wallets)
CREATE TABLE IF NOT EXISTS accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(30) UNIQUE NOT NULL,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL DEFAULT 'CHECKING',
    balance NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    iban VARCHAR(34),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets (user-level spending wallet)
CREATE TABLE IF NOT EXISTS wallets (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    balance NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    daily_limit NUMERIC(19,4) DEFAULT 100000.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    owner_id BIGINT REFERENCES users(id),
    source_account_id BIGINT REFERENCES accounts(id),
    destination_account_id BIGINT REFERENCES accounts(id),
    beneficiary_id BIGINT,
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description TEXT,
    fee NUMERIC(19,4) DEFAULT 0,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Beneficiaries (saved transfer recipients)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    iban VARCHAR(34),
    account_number VARCHAR(30),
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'DZD',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products catalog (Paysera-style financial products)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    monthly_fee NUMERIC(10,2) DEFAULT 0,
    features TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User product subscriptions
CREATE TABLE IF NOT EXISTS user_products (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    subscribed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE (user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_owner ON transactions(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_owner ON beneficiaries(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_products_user ON user_products(user_id);

-- =============================================
-- SEED: FinFlow Products Catalog
-- =============================================
INSERT INTO products (code, name, description, category, monthly_fee, features, active) VALUES
('COMPTE_COURANT',      'Compte Courant FinFlow',     'Compte courant avec IBAN DZ, virements illimités',              'ACCOUNT',  0,    'IBAN DZ,Virements illimités,Carte virtuelle gratuite,Historique 24 mois', true),
('COMPTE_EPARGNE',      'Compte Épargne Plus',         'Compte épargne avec taux préférentiel 3.5%',                   'SAVINGS',  0,    'Taux 3.5% annuel,Sans frais de tenue,Plafond 5 000 000 DZD,Intérêts mensuels', true),
('CARTE_DEBIT',         'Carte Débit FinFlow',         'Carte Visa débit pour paiements et retraits DAB',              'CARD',     500,  'Paiement en ligne,Retrait DAB,Plafond 50 000 DZD/jour,Alertes SMS', true),
('CARTE_VIRTUELLE',     'Carte Virtuelle',             'Carte virtuelle sécurisée pour achats en ligne',               'CARD',     0,    'Génération instantanée,Usage unique disponible,Paiement 3D Secure,Sans frais', true),
('VIREMENT_INTERNAT',   'Virements Internationaux',   'Envoi et réception de fonds vers l''étranger',                  'TRANSFER', 1500, 'SWIFT/BIC,Multi-devises,Suivi en temps réel,Taux de change compétitif', true),
('COMPTE_PRO',          'Compte Business FinFlow',    'Compte professionnel avec fonctionnalités avancées',            'BUSINESS', 2000, 'Multi-utilisateurs,API bancaire ouverte,Rapports financiers,Support prioritaire', true)
ON CONFLICT (code) DO NOTHING;

-- SEED: Sample accounts for admin user (wallet)
INSERT INTO wallets (owner_id, balance, currency, daily_limit, status)
SELECT id, 250000.00, 'DZD', 500000.00, 'ACTIVE'
FROM users WHERE username = 'admin'
ON CONFLICT (owner_id) DO NOTHING;

INSERT INTO accounts (account_number, owner_id, type, balance, currency, status, iban)
SELECT 'FF-0000000001', id, 'CHECKING', 125000.00, 'DZD', 'ACTIVE', 'DZ590000000000000000000001'
FROM users WHERE username = 'admin'
ON CONFLICT (account_number) DO NOTHING;

INSERT INTO accounts (account_number, owner_id, type, balance, currency, status, iban)
SELECT 'FF-0000000002', id, 'SAVINGS', 500000.00, 'DZD', 'ACTIVE', 'DZ590000000000000000000002'
FROM users WHERE username = 'admin'
ON CONFLICT (account_number) DO NOTHING;

-- SEED: Sample beneficiaries
INSERT INTO beneficiaries (owner_id, name, iban, bank_name, currency, active)
SELECT id, 'Ali Benali', 'DZ590000100000000000000011', 'CPA Banque', 'DZD', true
FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO beneficiaries (owner_id, name, iban, bank_name, currency, active)
SELECT id, 'Sara Hamidi', 'DZ590000200000000000000022', 'BNA Banque', 'DZD', true
FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- SEED: Sample transactions for admin
INSERT INTO transactions (reference_number, owner_id, type, amount, currency, status, description, processed_at)
SELECT 'TXN-' || gen_random_uuid(), id, 'DEPOSIT', 500000.00, 'DZD', 'COMPLETED', 'Dépôt initial FinFlow', NOW() - INTERVAL '30 days'
FROM users WHERE username = 'admin'
ON CONFLICT (reference_number) DO NOTHING;

INSERT INTO transactions (reference_number, owner_id, type, amount, currency, status, description, processed_at)
SELECT 'TXN-' || gen_random_uuid(), id, 'TRANSFER', 25000.00, 'DZD', 'COMPLETED', 'Virement vers Ali Benali', NOW() - INTERVAL '5 days'
FROM users WHERE username = 'admin'
ON CONFLICT (reference_number) DO NOTHING;

INSERT INTO transactions (reference_number, owner_id, type, amount, currency, status, description, processed_at)
SELECT 'TXN-' || gen_random_uuid(), id, 'PAYMENT', 8500.00, 'DZD', 'COMPLETED', 'Paiement facture Sonelgaz', NOW() - INTERVAL '2 days'
FROM users WHERE username = 'admin'
ON CONFLICT (reference_number) DO NOTHING;
