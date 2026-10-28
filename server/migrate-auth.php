<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
$dir=$argv[1]??'';
if(!$dir||!is_file($dir.'/profiles.sqlite')){fwrite(STDERR,"Usage: php server/migrate-auth.php PRIVATE_DATA_DIR\n");exit(1);}
if(!defined('PASSWORD_ARGON2ID')){fwrite(STDERR,"PHP Argon2id support is required.\n");exit(1);}
require __DIR__.'/auth-schema.php';
$db=new PDO('sqlite:'.$dir.'/profiles.sqlite',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
migrateAuth($db);
echo "Account schema migrated. Existing accounts, profiles and codes preserved.\n";
