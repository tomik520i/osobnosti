<?php
// Run as the PHP service user. Never put this script or runtime data in DocumentRoot.
declare(strict_types=1);
if(!defined('PASSWORD_ARGON2ID')){fwrite(STDERR,"PHP Argon2id is required.\n");exit(1);}
require __DIR__.'/auth-schema.php';
$dir=$argv[1]??'';
$origin=$argv[2]??'';
$url=parse_url($origin);
$local=is_array($url)&&in_array($url['host']??'',['127.0.0.1','localhost'],true);
if(!$dir||!is_array($url)||!isset($url['host'])||isset($url['user'])||isset($url['pass'])||isset($url['query'])||isset($url['fragment'])||isset($url['path'])||(!in_array($url['scheme']??'',['https'],true)&&!(($url['scheme']??'')==='http'&&$local))){
    fwrite(STDERR,"Usage: php server/setup.php ABSOLUTE_PRIVATE_DATA_DIR HTTPS_ORIGIN\n");exit(1);
}
$proxy=getenv('OSOBNOSTI_TRUSTED_PROXY')?:'';
if($proxy&&!filter_var($proxy,FILTER_VALIDATE_IP)){fwrite(STDERR,"Invalid trusted proxy address.\n");exit(1);}
if(!is_dir($dir))mkdir($dir,0700,true);
if(!is_dir($dir.'/sessions'))mkdir($dir.'/sessions',0700);
if(!file_exists($dir.'/config.php')){
    $config=['origin'=>$origin,'proxy'=>$proxy,'key'=>bin2hex(random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES))];
    file_put_contents($dir.'/config.php','<?php return '.var_export($config,true).';');chmod($dir.'/config.php',0600);
}
$db=new PDO('sqlite:'.$dir.'/profiles.sqlite');$db->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
$db->exec('PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;
CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY,key_hash TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS profiles(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,payload TEXT NOT NULL,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS profile_owner ON profiles(owner);
CREATE TABLE IF NOT EXISTS shares(id TEXT PRIMARY KEY,profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,token_hash TEXT NOT NULL UNIQUE,scopes TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(bucket TEXT NOT NULL,window INTEGER NOT NULL,hits INTEGER NOT NULL,expires INTEGER NOT NULL,PRIMARY KEY(bucket,window));');
chmod($dir.'/profiles.sqlite',0600);
migrateAuth($db);
echo "Database initialized. No credentials printed.\n";
