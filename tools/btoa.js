
/**
 * create the token for influxdb access
 * change username and password 
 */

const authentification ={
  username: 'admin',
  password: 'theSecretOne'
}
/**
 * 
 * @param {string} b 
 * @returns string
 */
const nodeBtoa = (b) => Buffer.from(b).toString('base64');


console.log("Token:", nodeBtoa(`${authentification.username}:${authentification.password}`))
