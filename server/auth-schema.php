<?php
declare(strict_types=1);
function migrateAuth(PDO $db): void {
    $db->exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    $db->beginTransaction();
    try {
        $columns=$db->query('PRAGMA table_info(accounts)')->fetchAll(PDO::FETCH_COLUMN,1);
        foreach(['nickname'=>'TEXT','nickname_key'=>'TEXT','password_hash'=>'TEXT','auth_version'=>'INTEGER NOT NULL DEFAULT 1'] as $name=>$type) {
            if(!in_array($name,$columns,true))$db->exec("ALTER TABLE accounts ADD COLUMN $name $type");
        }
        $db->exec('CREATE UNIQUE INDEX IF NOT EXISTS account_nickname ON accounts(nickname_key);
        CREATE TABLE IF NOT EXISTS remember_tokens(selector TEXT PRIMARY KEY,validator_hash TEXT NOT NULL,owner TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,auth_version INTEGER NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL);
        CREATE INDEX IF NOT EXISTS remember_owner ON remember_tokens(owner);');
        $db->commit();
    } catch(Throwable $e) {$db->rollBack();throw $e;}
}
