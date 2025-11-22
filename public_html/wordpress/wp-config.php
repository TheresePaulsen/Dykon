<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'theresepaulsen_dk_db' );

/** Database username */
define( 'DB_USER', 'theresepaulsen_dk' );

/** Database password */
define( 'DB_PASSWORD', 'ky3thab9xnwgDF5EARBG' );

/** Database hostname */
define( 'DB_HOST', 'mysql99.unoeuro.com' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'S6?rVsD%zjvP$KS($2Skp!aH:j@r1cDg1G<9j>A5* eRKS}.6X |{aOz7`T!{j-D' );
define( 'SECURE_AUTH_KEY',  '(?&^C^Sz,-%^I#-+_h7/_,vXgC]%T-GtQ3Df!vtAnr=xnZFCbDB9&&EA@P7wE(]J' );
define( 'LOGGED_IN_KEY',    'P-#3a{=]&O3pyKvP813ixQ9P5B!@C9JInTBud~JSPStPU6kl#}?n5GE.*dD6;x,Z' );
define( 'NONCE_KEY',        'hnaahn(qldKQlB9&M*F}?Gc:7(,TzoM7?{WxZJmR4H1N<%kLV+Bis!VdHK0u`}1t' );
define( 'AUTH_SALT',        'MeD(YPX]W#bFy$6c*?Ka;)eG{/1LphNKCc9m5kI0$n8EW_N91g(K6S!_sfVQ2gwB' );
define( 'SECURE_AUTH_SALT', 'RZm~P{PMR(60$rV67x#/lE;e6b~lGlIG48EG=$Tfhjn~Nra7f@hP-(c*PuQofqGq' );
define( 'LOGGED_IN_SALT',   '5:iaB%H+*H)]NfXoYDI0Z<SLLqY!Y#~!&xV<hXYwYg;b)v}{Fj7S}2j]i>@b7B_~' );
define( 'NONCE_SALT',       'mg5nV =vqrD5hkB>3:RT*IPpo-G[Q?z<>+eO@{[Nk=Q]$Vg@{cV?+)o3wVBw^R(a' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
