import fs from 'fs';
import path from 'path';

// ── JSON-file backed store ──────────────────────────────────────
// Persists across restarts; no external DB required.

interface User {
    id: string;
    address: string;
    username: string | null;
    createdAt: string;
}

interface Transaction {
    id: string;
    hash: string;
    from: string;
    to: string;
    amount: number;
    asset: string;
    type: string;
    status: string;
    timestamp: string;
    userId: string | null;
}

interface VaultPosition {
    id: string;
    vaultId: string;
    balance: number;
    userId: string;
    updatedAt: string;
}

interface DbData {
    users: User[];
    transactions: Transaction[];
    vaultPositions: VaultPosition[];
}

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

function ensureDir() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function read(): DbData {
    ensureDir();
    if (!fs.existsSync(DB_PATH)) return { users: [], transactions: [], vaultPositions: [] };
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch {
        return { users: [], transactions: [], vaultPositions: [] };
    }
}

function write(data: DbData) {
    ensureDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

// ── Public API ──────────────────────────────────────────────────

export const db = {
    // ─ Users ─
    findUserByAddress(address: string): User | undefined {
        return read().users.find(u => u.address === address);
    },

    upsertUser(address: string): User {
        const data = read();
        let user = data.users.find(u => u.address === address);
        if (!user) {
            user = { id: uuid(), address, username: null, createdAt: new Date().toISOString() };
            data.users.push(user);
            write(data);
        }
        return user;
    },

    // ─ Transactions ─
    createTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
        const data = read();
        const record: Transaction = { ...tx, id: uuid(), timestamp: new Date().toISOString() };
        data.transactions.push(record);
        write(data);
        return record;
    },

    getTransactions(filter?: { from?: string; to?: string; type?: string; status?: string }): Transaction[] {
        let txs = read().transactions;
        if (filter) {
            if (filter.from) txs = txs.filter(t => t.from === filter.from);
            if (filter.to) txs = txs.filter(t => t.to === filter.to);
            if (filter.type) txs = txs.filter(t => t.type === filter.type);
            if (filter.status) txs = txs.filter(t => t.status === filter.status);
        }
        return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    getTransactionsForUser(address: string): Transaction[] {
        return read().transactions
            .filter(t => t.from === address || t.to === address)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    sumTransactions(filter: { from?: string; type?: string; status?: string }): number {
        let txs = read().transactions;
        if (filter.from) txs = txs.filter(t => t.from === filter.from);
        if (filter.type) txs = txs.filter(t => t.type === filter.type);
        if (filter.status) txs = txs.filter(t => t.status === filter.status);
        return txs.reduce((s, t) => s + t.amount, 0);
    },

    uniqueRecipients(filter: { from?: string; type?: string; status?: string }): number {
        let txs = read().transactions;
        if (filter.from) txs = txs.filter(t => t.from === filter.from);
        if (filter.type) txs = txs.filter(t => t.type === filter.type);
        if (filter.status) txs = txs.filter(t => t.status === filter.status);
        return new Set(txs.map(t => t.to)).size;
    },

    // ─ Vault Positions ─
    getVaultPositions(userId: string): VaultPosition[] {
        return read().vaultPositions.filter(v => v.userId === userId);
    },

    sumVaultBalance(userId?: string): number {
        let positions = read().vaultPositions;
        if (userId) positions = positions.filter(v => v.userId === userId);
        return positions.reduce((s, v) => s + v.balance, 0);
    },

    findVaultPosition(userId: string, vaultId: string): VaultPosition | undefined {
        return read().vaultPositions.find(v => v.userId === userId && v.vaultId === vaultId);
    },

    upsertVaultPosition(userId: string, vaultId: string, incrementBy: number): VaultPosition {
        const data = read();
        let pos = data.vaultPositions.find(v => v.userId === userId && v.vaultId === vaultId);
        if (pos) {
            pos.balance += incrementBy;
            pos.updatedAt = new Date().toISOString();
        } else {
            pos = { id: uuid(), userId, vaultId, balance: incrementBy, updatedAt: new Date().toISOString() };
            data.vaultPositions.push(pos);
        }
        write(data);
        return pos;
    },

    decrementVaultPosition(userId: string, vaultId: string, amount: number): VaultPosition | null {
        const data = read();
        const pos = data.vaultPositions.find(v => v.userId === userId && v.vaultId === vaultId);
        if (!pos || pos.balance < amount) return null;
        pos.balance -= amount;
        pos.updatedAt = new Date().toISOString();
        write(data);
        return pos;
    }
};
