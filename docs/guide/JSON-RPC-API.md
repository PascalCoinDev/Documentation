---
sidebarDepth: 4
---

# JSON RPC API Specification & Guideline

This page provides full documentation for the PascalCoin JSON-RPC API. 

**NOTE**: There is a full C# wrapper for this API called [NPascalCoin](https://github.com/Sphere10/NPascalCoin) suitable for mobile and enterprise integrations.

## Contents ##
- [Introduction](#introduction)
  - [JSON RPC standard 2.0](#json-rpc-standard-20)
  - [HTTP Post Details](#http-post-details)
  - [Example](#example)
- [Data Types](#data-types)
    * [Account Object](#account-object)
    * [Block Object](#block-object)
    * [Operation Object](#operation-object)
    * [Multioperation Object](#multioperation-object)
    * [Connection Object](#connection-object)
    * [Public Key Object](#public-key-object)
    * [Raw Operations Object](#raw-operations-object)
    * [PascalCoin64 Encoding](#pascalcoin64-encoding)
    * [Error codes](#error-codes)
- [API](#application-programming-interface)
    * All calls (JSON-RPC methods)

[JSON](http://json.org/) is a lightweight data-interchange format. It can represent numbers, strings, ordered sequences of values, and collections of name/value pairs.
[JSON-RPC](http://www.jsonrpc.org/specification) is a stateless, light-weight remote procedure call (RPC) protocol. Primarily this specification defines several data structures and the rules around their processing. It is transport agnostic in that the concepts can be used within the same process, over sockets, over HTTP, or in many various message passing environments. It uses JSON ([RFC 4627](http://www.ietf.org/rfc/rfc4627.txt)) as data format.

## Introduction
In order to work properly with Pascal Coin, you must follow these instructions:

### JSON RPC Standard 2.0  

PascalCoin uses (by default) the pure [JSON RPC](http://www.jsonrpc.org/specification) 2.0 standard  

This means that:
- **Every call MUST include 3 params**: {"jsonrpc": "2.0", "method": "XXX", "id": YYY}
  - jsonrpc : String value = "2.0"
  - method : String value, name of the method to call
  - id : Integer value
- Optionally can contain another param called "params" holding an object. Inside we will include params to send to the method
  - {"jsonrpc": "2.0", "method": "XXX", "id": YYY, **"params":{"p1":" ","p2":" "}**}
- If JSON is not JSON RPC Standard 2.0 compliant, it will be rejected without a response.
- If JSON does not have a valid "id" value it will not be processed and rejected without a response.

### HTTP POST Details

All calls will be using HTTP protocol (HTTP 1.1) and passing JSON calls by POST at port 4003
- Protocol: HTTP v1.1
- Port: **4003**
- Http method: POST

### Example
```js
// Request to server at localhost. Method "getblockcount" (Returns block count of the PascalCoin network)
curl -X POST --data '{"jsonrpc":"2.0","method":"getblockcount","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": 26724
}
```


## Data Types  

RPC Calls could include/return these data types:
- Integers, strings, boolean (true or false) or null
- HEXASTRING: String that contains an hexadecimal value (ex. "4423A39C"). An hexadecimal string is always an even character length.
- PASCURRENCY: Pascal Coin currency is a maximum 4 decimal number (ex. 12.1234). Decimal separator is a "." (dot)
- JSON "specific" Objects: List of some objects returned by RPC calls and used for many methods: (See each method to know which object returns)  

***********************************************************************************

### Account Object  
  
An "Account object" is a JSON object with information about an account. Fields are:  
- `account` : Integer - Account number
- `enc_pubkey` : HEXASTRING - Encoded public key value (See [decodepubkey](#decodepubkey))
- `balance` : PASCURRENCY - Account balance
- `n_operation` : Integer - Operations made by this account _(Note: When an account receives a transaction, `n_operation` is not changed)_
- `updated_b` Integer - Last block that updated this account. If equal to blockchain blocks count it means that it has pending operations to be included to the blockchain.  
- `state` : String - Values can be `normal` or `listed`. When listed then account is for sale
- `locked_until_block` : Integer - Until what block this account is locked. Only set if state is `listed`
- `price` : PASCURRENCY - Price of account. Only set if state is `listed`
- `seller_account` : Integer - Seller's account number. Only set if state is `listed`
- `private_sale` : Boolean - Whether sale is private. Only set if state is `listed`
- `new_enc_pubkey` : HEXSTRING - Private buyers public key. Only set if state is `listed` and `private_sale` is true
- `name` : String - Public name of account. Follows [PascalCoin64](#pascalcoin64-encoding) Encoding
- `type` : Integer - Type of account. Valid values range from 0..65535

***********************************************************************************

### Block Object  
  
A "Block object" is a JSON object with information about a Blockchain's block. Fields are:  
- `block` : Integer - Block number
- `enc_pubkey` : HEXASTRING - Encoded public key value used to init 5 created accounts of this block (See [decodepubkey](#decodepubkey) )
- `reward` : PASCURRENCY - Reward of first account's block
- `fee` : PASCURRENCY - Fee obtained by operations
- `ver` : Integer - Pascal Coin protocol used
- `ver_a` : Integer - Pascal Coin protocol available by the miner
- `timestamp` : Integer - Unix timestamp  
- `target` : Integer - Target used
- `nonce` : Integer - Nonce used
- `payload` : String - Miner's payload
- `sbh` : HEXASTRING - SafeBox Hash
- `oph` : HEXASTRING - Operations hash
- `pow` : HEXASTRING - Proof of work
- `operations` : Integer - Number of operations included in this block  
- `hashratekhs` : Integer - Estimated network hashrate calculated by previous 50 blocks average
- `maturation` : Integer - Number of blocks in the blockchain higher than this

***********************************************************************************

### Operation Object

**Please note: Operation object has changed from V2 to V3, please read migration procedure**: https://github.com/PascalCoin/PascalCoin/wiki/Migration-to-V3#operation-object-changes

An "Operation object" is a JSON object with information about an operation. Fields are:
- `valid` : Boolean (optional) - If operation is invalid, value=false
- `errors` : String (optional) - If operation is invalid, an error description
- `block` : Integer - Block number (only when valid)
- `time` : Integer - Block timestamp (only when valid)
- `opblock` : Integer - Operation index inside a block (0..operations-1). _Note: If `opblock`=-1 means that is a blockchain reward_ (only when valid)
- `maturation` : Integer - Return null when operation is not included on a blockchain yet, 0 means that is included in highest block and so on...
- `optype` : Integer - Operation type. can be:
  - 0 = Blockchain reward
  - 1 = Transaction 
  - 2 = Change key
  - 3 = Recover founds (lost keys)
<<<<<<< 34811f7049b465e964e73d7808e7ba744d5a3f97
  - 4 = List account for sale
  - 5 = Delist account (not for sale)
  - 6 = Buy account
  - 7 = Change key (signed by another account)
  - 8 = Change account info
  - 9 = Multioperation (* New on Build 3.0 *)
=======
  - 4 = Account for sale
  - 6 = Account purchased
  - 8 = Account name changed
>>>>>>> Added optype information 4,6 and 8.
- `account` : Integer - Account affected by this operation. Note: A transaction has 2 affected accounts.
- `optxt` : String - Human readable operation type
- `amount` : PASCURRENCY - Amount of coins transferred from `sender_account` to `dest_account` (Only apply when `optype`=1)
- `fee` : PASCURRENCY - Fee of this operation
- `balance` : PASCURRENCY - Balance of `account` after this block is introduced in the Blockchain
  - Note: `balance` is a calculation based on current safebox account balance and previous operations, it's only returned on pending operations and account operations
- `sender_account` : Integer - Sender account in a transaction (only when `optype` = 1) **DEPRECATED**, use `senders` array instead
- `dest_account` : Integer - Destination account in a transaction (only when `optype` = 1) **DEPRECATED**, use `receivers` array instead
- `enc_pubkey` : HEXASTRING - Encoded public key in a change key operation (only when `optype` = 2). See [decodepubkey](#decodepubkey) **DEPRECATED**, use `changers` array instead
- `ophash` : HEXASTRING - Operation hash used to find this operation in the blockchain
- `old_ophash` : HEXSTRING - Operation hash as calculated prior to V2. Will only be populated for blocks prior to V2 activation. **DEPRECATED**
- `subtype` : String - Associated with `optype` param, can be used to discriminate from the point of view of operation (sender/receiver/buyer/seller ...)
- `signer_account` : Integer - Will return the account that signed (and payed fee) for this operation. Not used when is a Multioperation (`optype` = 9)
- `enc_pubkey` : HEXSTRING - Will return both change key and the private sale public key value **DEPRECATED**, use `changers` array instead
- `senders` : ARRAY of objects with senders, for example in a transaction (`optype` = 1) or multioperation senders (`optype` = 9)
  - `account` : Sending Account 
  - `n_operation`
  - `amount` : PASCURRENCY - In negative value, due it's outgoing from "account"
  - `payload` : HEXASTRING
- `receivers` : ARRAY of objects - When is a transaction or multioperation, this array contains each receiver
  - `account` : Receiving Account 
  - `amount` : PASCURRENCY - In positive value, due it's incoming from a sender to "account"
  - `payload` : HEXASTRING
- `changers` : ARRAY of objects - When accounts changed state
  - `account` : changing Account 
  - `n_operation`
  - `new_enc_pubkey` : If public key is changed or when is listed for a private sale
  - `new_name` : If name is changed
  - `new_type` : If type is changed
  - `seller_account` : If is listed for sale (public or private) will show seller account
  - `account_price` : PASCURRENCY - If is listed for sale (public or private) will show account price
  - `locked_until_block` : If is listed for private sale will show block locked
  - `fee` : PASCURRENCY - In negative value, due it's outgoing from "account"

***********************************************************************************

### Multioperation Object

A "Multioperation object" is a JSON object with information about a multioperation. Fields are:
- `rawoperations` : HEXASTRING - Single multioperation in RAW format
- `senders`: ARRAY of JSON Objects, each object with fields:
  - `account` : Sending Account 
  - `n_operation`: Integer
  - `amount` : In negative value, due it's outgoing from "account"
  - `payload` : HEXASTRING
- `receivers`: ARRAY of JSON Objects, each object with fields:
  - `account` : Receiving Account 
  - `amount` : In positive value, due it's incoming from a sender to "account"
  - `payload` : HEXASTRING
- `changers` : ARRAY of JSON Objects, each object with fields:
  - `account` : changing Account 
  - `n_operation`
  - `new_enc_pubkey` : If public key is changed
  - `new_name` : If name is changed
  - `new_type` : If type is changed
- `amount` : PASCURRENCY Amount received by receivers
- `fee` : PASCURRENCY Equal to "total send" - "total received"
- `digest` : HEXASTRING value of the digest that must be signed
- `signed_count` : Integer with info about how many accounts are signed. Does not check if signature is valid for a multioperation not included in blockchain 
- `not_signed_count` : Integer with info about how many accounts are pending to be signed
- `signed_can_execute`	: Boolean. True if everybody signed. Does not check if MultiOperation is well formed or can be added to Network because is an offline call

***********************************************************************************

### Connection Object

A "Connection object" is a JSON object with a connection to other node information
- `server` : Boolean - True if this connection is to a server node. False if this connection is a client node
- `ip` : String
- `port` : Integer
- `secs` : Integer - seconds of live of this connection 
- `sent` : Integer - Bytes sent
- `recv` : Integer - Bytes received
- `appver` : String - Other node App version
- `netvar` : Integer - Net protocol of other node
- `netvar_a` : Integer - Net protocol available of other node
- `timediff` : Integer - Net timediff of other node (vs wallet)

***********************************************************************************

### Public Key Object

A "Public Key object" is a JSON object with information about a public key.
- `name` : String - Human readable name stored at the Wallet for this key
- `can_use` : Boolean - If false then Wallet doesn't have Private key for this public key, so, Wallet cannot execute operations with this key
- `enc_pubkey` : HEXASTRING - Encoded value of this public key. This HEXASTRING has no checksum, so, if using it always must be sure that value is correct
- `b58_pubkey` : String - Encoded value of this public key in Base 58 format, also contains a checksum. This is the same value that Application Wallet exports as a public key
- `ec_nid` : Integer - Indicates which EC type is used:
  - 714 = secp256k1
  - 715 = secp384r1
  - 729 = secp283k1
  - 716 = secp521r1
- `x` : HEXASTRING with x value of public key
- `y` : HEXASTRING with y value of public key

***********************************************************************************

### Raw Operations Object

A "Raw operations object" is a JSON object with information about a signed operation made by "signsendto" or "signchangekey"
- `operations` : Integer - Count how many operations has `rawoperations` param
- `amount` : PASCURRENCY - Total amount
- `fee` : PASCURRENCY - Total fee
- `rawoperations` : HEXASTRING - This is the operations in raw format

***********************************************************************************

### PascalCoin64 Encoding
Available characters include:
```
abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-+{}[]_:`|<>,.?/~
```

First character cannot start with number and limtied to subset:
```
abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+{}[]_:`|<>,.?/~
```

Account names encoded in PascalCoin64 must be 3..64 chars length

***********************************************************************************

### Error codes

JSON-RPC Error codes will be in a JSON-Object in this format:
- `code` : Integer - Error code
- `message` : String - Human readable error description

#### List of usual error codes
- 100 - Internal error
- 1001 - Method not found
- 1002 - Invalid account
- 1003 - Invalid block
- 1004 - Invalid operation
- 1005 - Invalid public key
- 1010 - Not found
- 1015 - Wallet is password protected
- 1016 - Invalid data

***********************************************************************************

## Application Programming Interface  
  
All calls will be using http transport protocol and JSON will be passed by POST.

### JSON-RPC methods list

- [addnode](#addnode) - Adds a node to connect  
- [getaccount](#getaccount) - Get an account information
- [getwalletaccounts](#getwalletaccounts) - Get available wallet accounts information (all or filtered by public key)
- [getwalletaccountscount](#getwalletaccountscount) - Get number of available wallet accounts (total or filtered by public key)
- [getwalletpubkeys](#getwalletpubkeys) - Get wallet public keys
- [getwalletpubkey](#getwalletpubkey) - Search for a public key in the wallet
- [getwalletcoins](#getwalletcoins) - Get wallet coins total balance (total or filtered by public key)
- [getblock](#getblock) - Get block information
- [getblocks](#getblocks) - Get a list of blocks (last n blocks, or from start to end)
- [getblockcount](#getblockcount) - Get blockchain high in this node
- [getblockoperation](#getblockoperation) - Get an operation of the block information
- [getblockoperations](#getblockoperations) - Get all operations of specified block 
- [getaccountoperations](#getaccountoperations) - Get operations made to an account
- [getpendings](#getpendings) - Get pendings operations to be included in the blockchain
- [getpendingscount](#getpendingscount) - Returns node pending buffer count (* New on Build 3.0 *)
- [findoperation](#findoperation) - Finds an operation by "ophash"
- [findaccounts](#findaccounts) - Find accounts by name/type
- [sendto](#sendto) - Executes a transaction
- [changekey](#changekey) - Executes a change key over an account
- [changekeys](#changekeys) - Executes a change key over multiple accounts
- [listaccountforsale](#listaccountforsale) - Lists an account for sale (public or private)
- [delistaccountforsale](#delistaccountforsale) - Delist an account for sale
- [buyaccount](#buyaccount) - Buy an account previously listed for sale (public or private)
- [changeaccountinfo](#changeaccountinfo) - Changes an account Public key, or name, or type value (at least 1 on 3)
- [signsendto](#signsendto) - Creates and signs a transaction, but no transfers it to network
- [signchangekey](#signchangekey) - Creates and signs a change key over an account, but no transfers it to network  
- [signlistaccountforsale](#signlistaccountforsale) - Signs a List an account for sale (public or private) for cold wallets
- [signdelistaccountforsale](#signdelistaccountforsale) - Signs a List an account for sale (public or private) for cold wallets
- [signbuyaccount](#signbuyaccount) - Signs a buy operation for cold wallets
- [signchangeaccountinfo](#signchangeaccountinfo) - Signs a change account info for cold cold wallets
- [operationsinfo](#operationsinfo) - Gets information about a signed operation without transfering it to network 
- [executeoperations](#executeoperations) - Executes a signed operation and transfers it to the network
- [nodestatus](#nodestatus) - Returns node status
- [encodepubkey](#encodepubkey) - Encodes a public key
- [decodepubkey](#decodepubkey) - Decodes a public key
- [payloadencrypt](#payloadencrypt) - Encrypts a text
- [payloaddecrypt](#payloaddecrypt) - Decrypts a text
- [getconnections](#getconnections) - Lists all active connections of this node
- [addnewkey](#addnewkey) - Adds a new key to the Wallet
- [lock](#lock) - Locks the Wallet
- [unlock](#unlock) - Unlocks the Wallet
- [setwalletpassword](#setwalletpassword) - Changes wallet password
- [stopnode](#stopnode) - Stops the node
- [startnode](#startnode) - Starts the node
- [signmessage](#signmessage) - Signs a digest message using a public key (* New on Build 3.0 *)
- [verifysign](#verifysign) - Verify if a digest message is signed by a public key (* New on Build 3.0 *)
- [multioperationaddoperation](#multioperationaddoperation) - Adds operations to a multioperation (or creates a new multioperation and adds new operations) (* New on Build 3.0 *)
- [multioperationsignoffline](#multioperationsignoffline) - This method will sign a Multioperation found in a "rawoperations", must provide all n_operation info of each signer because can work in cold wallets (* New on Build 3.0 *)
- [multioperationsignonline](#multioperationsignonline) - This method will sign a Multioperation found in a "rawoperations" based on current safebox state public keys (* New on Build 3.0 *)
- [operationsdelete](#operationsdelete) - This method will delete an operation included in a Raw operations object (* New on Build 3.0 *)

 ***********************************************************************************
 
### addnode  
  
Add nodes to connect  
  
##### Params  
  
- `nodes` String containing 1 or multiple IP:port separated by ";"
  
##### Result (Intger)  
  
Returns an integer with nodes added  
  
##### Example  
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"addnode","params":{"nodes":"123.123.123.123:4004;7.7.7.7:4005"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": 2
}
```

***********************************************************************************

### getaccount  

Returns a JSON Object with account information including pending operations not included in blockchain yet, but affecting this account.  
**Tip:** _To know if there are pending operations, must look at `updated_b` param. It tells last block that modified this account. If this number is equal to blockchain blocks then this account is affected by pending operations (send/receive or change key)_  

##### Params  

- `account` Cardinal containing account number  

##### Result (JSON Object)  

Result is an [Account Object](#account-object)
  
##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getaccount","params":{"account":1920},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
     "account":1920,
     "enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B",
     "balance":29595.952,
     "n_operation":0,
     "updated_b":11973
     }
}
```

***********************************************************************************

### getwalletaccounts  
  
Returns a JSON array with all wallet accounts.  
  
##### Params  
  
- `enc_pubkey` HEXASTRING (optional). If provided, return only accounts of this public key
- `b58_pubkey` String (optional). If provided, return only accounts of this public key
  - Note: If use `enc_pubkey` and `b58_pubkey` together and is not the same public key, will return an error
- `start` Integer (optional, default = 0). If provided, will return wallet accounts starting at this position (index starts at position 0)
- `max` Integer (optional, default = 100). If provided, will return max accounts. If not provided, max=100 by default

##### Result (JSON Array)

Each JSON array item contains an [Account Object](#account-object)

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getwalletaccounts","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": [{
     "account":1920,
     "enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B",
     "balance":29595.952,
     "n_operation":0,
     "updated_b":11973
     },
     {
     "account":1921,
     "enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B",
     "balance":29.9521,
     "n_operation":0,
     "updated_b":11973
     }
  ]
}
```

***********************************************************************************

### getwalletaccountscount

Get number of available wallet accounts (total or filtered by public key)

##### Params 

- `enc_pubkey` HEXASTRING (optional). If provided, count only accounts of this public key
- `b58_pubkey` String (optional). If provided, return only accounts of this public key
  - Note: If use `enc_pubkey` and `b58_pubkey` together and is not the same public key, will return an error
- `start` Integer (optional, default = 0). If provided, will return wallet accounts starting at this position (index starts at position 0)
- `max` Integer (optional, default = 100). If provided, will return max accounts. If not provided, max=100 by default

##### Result (integer)

Returns an integer with total

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getwalletaccountscount","id":123,"params":{"enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B"}}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": 2
}
```
***********************************************************************************

### getwalletpubkeys

Returns a JSON Array with all pubkeys of the Wallet (address)

##### Params

- `start` Integer (optional, default = 0). If provided, will return wallet public keys starting at this position (index starts at position 0)
- `max` Integer (optional, default = 100). If provided, will return max public keys. If not provided, max=100 by default

##### Result

Returns a JSON Array with "[Public Key Object](#public-key-object)"


##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getwalletpubkeys","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": [{
     "name":"My key",
     "enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B",
     "can_use":true
     },
     {
     "name":"My key 2",
     "enc_pubkey":"CA02200026D497C8982EC538BC06FCC1F5FACA39A2CA6DFAEC601122155F388A08FEF3812000E8FDAA2C8D8375D022510A12DC65641B5D904A36B1E913C9B96A0A40C645D2F2",
     "can_use":true
     }]
}
```
***********************************************************************************

### getwalletpubkey

Returns a JSON Object with a public key if found in the Wallet

##### Params

- `enc_pubkey` HEXASTRING
- `b58_pubkey` String 
  - Note: If use `enc_pubkey` and `b58_pubkey` together and is not the same public key, will return an error

##### Result

Returns a JSON Object with a "[Public Key Object](#public-key-object)"

***********************************************************************************

### getwalletcoins  
  
Returns coins balance.  
  
##### Params  
  
- `enc_pubkey` HEXASTRING (optional). If provided, return only this public key balance
- `b58_pubkey` String (optional). If provided, return only this public key balance
  - Note: If use `enc_pubkey` and `b58_pubkey` together and is not the same public key, will return an error

##### Result (PASCURRENCY)

Returns a PASCURRENCY value with maximum 4 decimals

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getwalletcoins","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": 29625.9041
}
```
***********************************************************************************

### getblock

Returns a JSON Object with a block information

##### Params

- `block` : Integer - Block number (0..blocks count-1)  

##### Result  

Returns a JSON Object with a "[Block Object](#block-object)"


##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getblock","params":{"block":8888},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
    "block":8888,
  "enc_pubkey":"CA0220000E60B6F76778CFE8678E30369BA7B2C38D0EC93FC3F39E61468E29FEC39F13BF2000572EDE3C44CF00FF86AFF651474D53CCBDF86B953F1ECE5FB8FC7BB6FA16F114",
  "reward":100,
  "fee":0,
  "ver":1,
  "ver_a":0,
  "timestamp":1473161258,
  "target":559519020,
  "nonce":131965022,
  "payload":"New Node 9/4/2016 10:10:13 PM - Pascal Coin Miner & Explorer Build:1.0.2.0",
  "sbh":"5B75D33D9EFBF560EF5DA9B4A603528808626FE6C1FCEC44F83AF2330C6607EF",
  "oph":"81BE87831F03A2FE272C89BC6D2406DD57614846D9CEF30096BF574AB4AB3EE9",
  "pow":"00000000213A39EBBAB6D1FAEAA1EE528E398A587848F81FF66F7DA6113FC754",
  "operations":1
  }
}
```
***********************************************************************************

### getblocks

Returns a JSON Array with blocks information from "start" to "end" (or "last" n blocks)
Blocks are returned in DESCENDING order
See [getblock](#getblock) 

##### Params  

- `last` : Integer - Last n blocks in the blockchain (n>0 and n<=1000)
- `start` : Integer 
- `end` : Integers 
Note: Must use param `last` alone, or `start` and `end`


### getblockcount  

Returns an Integer with blockcount of node  

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getblockcount","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": 26724
}
```
***********************************************************************************

### getblockoperation

Returns a JSON Object with an operation inside a block

##### Params  
- `block` : Integer - Block number
- `opblock` : Integer - Operation (0..operations-1) of this block
  
##### Result  

Returns a JSON Object with a "[Operation Object](#operation-object)"

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getblockoperation","params":{"block":8888,"opblock":0},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
    "block":8888,
  "opblock":0,
  "optype":1,
  "time":1473161258,
  "account":43905,
  "optxt":"Transaction Sent to 40511-95",
  "amount":-100,
  "fee":0,
  "balance":0,
  "payload":"",
  "dest_account":40511,
  "ophash":"B822000081AB0000010000003032333646444430344246334637414434413042"
  }
}
```
***********************************************************************************

### getblockoperations

Returns a JSON Array with all operations of specified block
Operations are returned in DESCENDING order

##### Params  

- `block` : Integer - Block number
- `start` Integer (optional, default = 0). If provided, will start at this position (index starts at position 0)
- `max` Integer (optional, default = 100). If provided, will return max registers. If not provided, max=100 by default
  
##### Result  

Returns a JSON Array with "[Operation Object](#operation-object)" items

##### Example  

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getblockoperations","params":{"block":8888},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": [{
    "block":8888,
  "opblock":0,
  "optype":1,
  "time":1473161258,
  "account":43905,
  "optxt":"Transaction Sent to 40511-95",
  "amount":-100,
  "fee":0,
  "balance":0,
  "payload":"",
  "dest_account":40511,
  "ophash":"B822000081AB0000010000003032333646444430344246334637414434413042"
  }]
}
```
***********************************************************************************

### getaccountoperations

Return a JSON Array with "[Operation Object](#operation-object)" items. Operations made over an account
Operations are returned in DESCENDING order

##### Params
- `account` : Integer - Account number (0..accounts count-1)
- `depth` : Integer - (Optional, default value 100) Depth to search on blocks where this account has been affected. Allowed to use `deep` as a param name too.
- `start` Integer (optional, default = 0). If provided, will start at this position (index starts at position 0). If start is -1, then will include pending operations, otherwise only operations included on the blockchain
- `max` Integer (optional, default = 100). If provided, will return max registers. If not provided, max=100 by default

##### Result

Returns an array holding operations made over `account` in "[Operation Object](#operation-object)" format

##### Example

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getaccountoperations","params":{"account":101740},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": [
    {"block":22647,
  "opblock":0,
  "optype":1, // Note: This is a transaction
  "time":1476744324,
  "account":101740, 
  "optxt":"Transaction Received from 103844-87",
  "amount":20000,  // Note: This is an incoming transaction, so "amount" is a positive number
  "fee":0,
  "balance":20000,
  "payload":"",
  "sender_account":103844,
  "dest_account":101740,
  "ophash":"77580000A4950100020000003238453136333441383439393046414632443332"
  },{
  "block":21555,
  "opblock":0,
  "optype":2,  // Note: This is a change key operation
  "time":1476466491,
  "account":101740,
  "optxt":"Change Key to secp256k1",
  "amount":0,
  "fee":0,
  "balance":0,
  "payload":"",
  // This is the new public key due to change key operation
  "enc_pubkey":"CA02200078D867C93D58C2C46C66667A139543DCF8420D9119B7A0E06197D22A5BBCE5542000EA2E492FD8B90E48AF3D9EF438C6FBEA57C8A8E75889807DE588B490B1D57187",
  "ophash":"335400006C8D0100020000003330433034464446453130354434444445424141"
  },{
  "block":21255,
  "opblock":0,
  "optype":1,
  "time":1476378864,
  "account":101740,
  "optxt":"Transaction Sent to 63553-29",
  "amount":-100, // Note: This is an outgoing transaction, so "amount" is a negative number
  "fee":0,
  "balance":0,
  "payload":"",
  "sender_account":101740,
  "dest_account":63553, // Note: Dest account is the receiver
  "ophash":"075300006C8D0100010000003536463332393641383335344236323945464536"
  },{
  "block":20348,
  "opblock":-1, // Note: This is a blockchain reward. No operation number included (-1)
  "optype":0,   // optype = 0 = Blockhain reward
  "time":1476153843,
  "account":101740,
  "optxt":"Blockchain reward",
  "amount":100,
  "fee":0,
  "balance":100,
  "payload":"",
  "ophash":"" // Note: A blockchain reward has no ophash operation
  }
  ]
}
```
***********************************************************************************

### getpendings

Return a JSON Array with "[Operation Object](#operation-object)" items with operations pending to be included at the Blockchain.

##### Params
  
- `start` : Integer (optional) - Default value 0
- `max` : Integer (optional) - Default value 100, use 0=All

##### Result

Returns an array holding pending operations in "[Operation Object](#operation-object)" format

##### Example

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"getpendings","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": []  // Note: None pending = empty array
}
```
***********************************************************************************

### getpendingscount

Return pending opertions count

***********************************************************************************

### findoperation

Return a JSON Object in "[Operation Object](#operation-object)" format.

##### Params
  
- `ophash` : HEXASTRING - Value `ophash` received on an operation

##### Result

Returns "[Operation Object](#operation-object)" format JSON object

##### Example

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"findoperation","params":{"ophash":"075300006C8D0100010000003536463332393641383335344236323945464536"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
  "block":21255,
  "opblock":0,
  "optype":1,
  "time":1476378864,
  "account":101740,
  "optxt":"Transaction Sent to 63553-29",
  "amount":-100, 
  "fee":0,
  "balance":0,
  "payload":"",
  "sender_account":101740,
  "dest_account":63553, // Note: Dest account is the receiver
  "ophash":"075300006C8D0100010000003536463332393641383335344236323945464536"
  }
}
```
***********************************************************************************

### findaccounts
Find accounts by name/type and returns them as an array of "Account Object"

##### Params
- `name` : String - If has value, will return the account that match name
- `type` : Integer - If has value, will return accounts with same type
- `start` : Integer - Start account (by default, 0) - **NOTE:** Is the "start account number", when executing multiple calls you must set `start` value to the latest returned account number + 1 (Except if searching by public key, see below)
- `max` : Integer - Max of accounts returned in array (by default, 100)
- `name` : String - If has value, will return the account matching this name
- `exact` : Boolean (True by default) - If False and `name` has value will return accounts containing `name` value in it's name (multiple accounts can match)
- `min_balance`,`max_balance` : PASCURRENCY - If have value, will filter by current account balance
- `enc_pubkey` or `b58_pubkey` : HEXASTRING or String - Will return accounts with this public key. **NOTE:** When searching by public key the `start` param value is the position of indexed public keys list instead of accounts numbers

##### Result
An array of "[Account](#account-object)" objects.

***********************************************************************************

### sendto
Executes a transaction operation from "sender" to "target"

##### Params
- `sender` : Integer - Sender account
- `target` : Integer - Destination account
- `amount` : PASCURRENCY - Coins to be transferred
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload "item" that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of "target" account. Only "target" will be able to decrypt this payload
  - `sender` : Using sender Public key. Only "sender" will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result
If transaction is successfull will return a JSON Object in "[Operation Object](#operation-object)" format.
Otherwise, will return a JSON-RPC error code with description

##### Example
Correct example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"sendto","params":{"sender":1234,"target":5678,"amount":100000,"fee":0.0001,"payload":"444F444F444F","payload_method":"aes","pwd":"MyPassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
  "block":0,
  "opblock":0,
  "optype":1,
  "time":1476363846,
  "account":1234,
  "optxt":"Transaction Sent to 5678-55",
  "amount":-100000, 
  "fee":0.0001,
  "balance":150605.9999,
  "payload":"842357F9C1842357F9C1842357F9C1842357F9C1",
  "sender_account":1234,
  "dest_account":5678, 
  "ophash":"000000006C8D0100010000003536463332393641383335344236323945464536"
  }
}
```

Error example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"sendto","params":{"sender":1234,"target":5678,"amount":100000,"fee":0.0001,"payload":"444F444F444F","payload_method":"aes","pwd":"MyPassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "error": {
    "code":1002,  // Note: See [Error codes](#error-codes)
  "message":"Private key of sender account 1234 not found in wallet"
  }
}
```
***********************************************************************************

### changekey

Executes a change key operation, changing "account" public key for a new one.  
Note that new one public key can be another Wallet public key, or none. When none, it's like a transaction, tranferring account owner to an external owner

##### Params
- `account` : Integer - Account number to change key
- `new_enc_pubkey` : HEXASTRING - New public key in encoded format
- `new_b58_pubkey` : String - New public key in Base 58 format (the same that Application Wallet exports)
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload "item" that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of "target" account. Only "target" will be able to decrypt this payload
  - `sender` : Using sender Public key. Only "sender" will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result

If operation is successfull will return a JSON Object in "[Operation Object](#operation-object)" format.
Otherwise, will return a JSON-RPC error code with description

##### Example

```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"changekey","params":{"account":101740,"new_enc_pubkey":"CA02200078D867C93D58C2C46C66667A139543DCF8420D9119B7A0E06197D22A5BBCE5542000EA2E492FD8B90E48AF3D9EF438C6FBEA57C8A8E75889807DE588B490B1D57187","fee":0.0001,"payload":"","payload_method":"none"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
  "block":21555,
  "opblock":0,
  "optype":2,  
  "time":1476466491,
  "account":101740,
  "optxt":"Change Key to secp256k1",
  "amount":0,
  "fee":0,
  "balance":0,
  "payload":"",
  "enc_pubkey":"CA02200078D867C93D58C2C46C66667A139543DCF8420D9119B7A0E06197D22A5BBCE5542000EA2E492FD8B90E48AF3D9EF438C6FBEA57C8A8E75889807DE588B490B1D57187",
  "ophash":"335400006C8D0100020000003330433034464446453130354434444445424141"
  }
}
```

Error example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"changekey","params":{"account":101740,"new_enc_pubkey":"CA02200078D867C93D58C2C46C66667A139543DCF8420D9119B7A0E06197D22A5BBCE5542000EA2E492FD8B90E48AF3D9EF438C6FBEA57C8A8E75889807DE588B490B1D57187","fee":0.0001,"payload":"","payload_method":"none"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "error": {
    "code":1002,  // Note: See [Error codes](#error-codes)
  "message":"Private key account 101740 not found in wallet"
  }
}
```
***********************************************************************************

### changekeys

Executes a change key operation, changing "account" public key for a new one, in multiple accounts
Works like [changekey](#changekey)

##### Params
- `accounts` : String - List of accounts separated by a comma
- See all other params from [changekey](#changekey)

##### Result

If operation is successfull will return a JSON Array with [Operation object](#operation-object) items for each key
If operation cannot be made, a JSON-RPC error message is returned

***********************************************************************************

### listaccountforsale

Lists an account for sale (public or private).

##### Params
- `account_target` : Account to be listed
- `account_signer` : Account that signs and pays the fee (must have same public key that listed account, or be the same)
- `price`: price account can be purchased for
- `seller_account` : Account that will receive `price` amount on sell
- `new_b58_pubkey`/`new_enc_pubkey`: If used, then will be a private sale
- `locked_until_block` : Block number until this account will be locked (a locked account cannot execute operations while locked)
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result
If operation is successfull will return an [Operation object](#operation-object).

***********************************************************************************

### delistaccountforsale
Delist an account for sale.

##### Params
- `account_target` : Account to be delisted
- `account_signer` : Account that signs and pays the fee (must have same public key that delisted account, or be the same)
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result
If operation is successfull will return an [Operation object](#operation-object).

***********************************************************************************

### buyaccount
Buy an account previously listed for sale (public or private).

##### Params
- `buyer_account` : Account number of buyer who is purchasing the account
- `account_to_purchase` : Account number being purchased
- `price` : Settlement price of account being purchased
- `seller_account` : Account of seller, receiving payment
- `new_b58_pubkey`/`new_enc_pubkey` : Post-settlement public key in base58 (or hex) format. Only supply one value.
- `amount` : Amount being transferred from buyer_account to seller_account (the settlement). This is a PASCURRENCY value.
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result
If operation is successfull will return an [Operation object](#operation-object).

***********************************************************************************

### changeaccountinfo
Changes an account Public key, or name, or type value (at least 1 on 3).

##### Params
- `account_target` : Account to be delisted
- `account_signer` : Account that signs and pays the fee (must have same public key that target account, or be the same)
- `new_b58_pubkey`/`new_enc_pubkey`: If used, then will change the target account public key
- `new_name`: If used, then will change the target account name
- `new_type`: If used, then will change the target account type
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password

##### Result
If operation is successfull will return an [Operation object](#operation-object).

***********************************************************************************

### signsendto

Creates and signs a "Send to" operation without checking information and without transfering to the network.
It's usefull for "cold wallets" that are off-line (not synchronized with the network) and only holds private keys

##### Params
- `rawoperations` : HEXASTRING (optional) - If we want to add a sign operation with other previous operations, here we must put previous `rawoperations` result
- `sender` : Integer - Sender account
- `target` : Integer - Target account
- `sender_enc_pubkey` or `sender_b58_pubkey` : HEXASTRING - Public key (in encoded format or b58 format) of the sender account
- `target_enc_pubkey` or `target_b58_pubkey` : HEXASTRING - Public key (in encoded format or b58 format) of the target account
- `last_n_operation` : Last value of `n_operation` obtained with an [Account object](#account-object), for example when called to [getaccount](#getaccount)
- `amount`,`fee`,`payload`,`payload_method`,`pwd` : Same values that calling [sendto](#sendto)

##### Result

Wallet must be unlocked and sender private key (searched with provided public key) must be in wallet.
No other checks are made (no checks for valid target, valid n_operation, valid amount or fee ...)
Returns a [Raw Operations Object](#raw-operations-object)

##### Example

Correct example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"signsendto","params":{"rawoperations":"", "sender":1234,"target":5678,"sender_enc_pubkey":"CA0220009D92DFA1D6F8B2CAE31194EE5433EE4AD457AE145C1C67E49A9196EE58A45B9F200046EAF20C0A26A80A7693E71C0222313A0187AFCA838209FF86FB740A4FFF7F0B","target_enc_pubkey":"CA0220001FD6019F7FBFCD9A34491643287402FB0CCB77F2A4F99482ADC11137CDF1FBD6200046924461A9069850A64E48E8EDB9C88764D3A0DC74AF929E335719F8A65B809B","last_n_operation":32,"amount":10.05,"fee":0.0001,"payload":"444F444F444F","payload_method":"aes","pwd":"MyPassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
  "operations":1,
  "ampount":10.05,
  "fee":0.0001,
  "rawoperations":"0300000002000000504902000300000000000000000000000000CA022000738037C3F1EFDDCCC2EB1F1B8C46CEE39754E2747F9872E5C3EA3DB18CD27FBA2000C719D3AF4C5BA978D540C62BDD4CEE694748AEE694C58552E7B93A6DB7D8337B4600CA0220000DC35167FE66C86C796224F8AE033DF14B35F897D0D4D4667592452CB489F64820000DEA2877A881343D924CE60361B52E2C84C43416D8C3C1C1490F648698B295272000FCD6002076A7D57121BB6AEC78E1C9A2FAA2D51A28E902A7C938E720BE661FAE2000EBA53DF857DDCF83F4E1C59AA331D940C5C208DC55639A5D3B167957D2C79AEC02000000504902000400000000000000000000000000CA0220000DC35167FE66C86C796224F8AE033DF14B35F897D0D4D4667592452CB489F64820000DEA2877A881343D924CE60361B52E2C84C43416D8C3C1C1490F648698B295274600CA022000738037C3F1EFDDCCC2EB1F1B8C46CEE39754E2747F9872E5C3EA3DB18CD27FBA2000C719D3AF4C5BA978D540C62BDD4CEE694748AEE694C58552E7B93A6DB7D8337B2000E8F4EDC8BCC76300B22D0C29EB1A2081CEB90DDAD731AFDD68F54AF89BF15F8620006190726B21150B5AF6AEA2B5566F1E269D82BD27E1EEEC68C757797AF18AECD5010000001B7E0200020000001C7E0200A08601000000000000000000000000000000CA022000260DC2894FEE5EE754C0DBF45CE3226F503B4356C41D6D7C7C3E248AF84A99F420001894135C91E837AB74EC47D2B14894A4A20467EFE9F985AF54C4212D4986EA4820008728CA6710ED2B8B79B52D7198DDE40162221100245462AAE48FF0818F47E40C20002021F6870F7488E62EC7CC8E7F86D6356C7A66413EFD6AE40B7F904EAC250085"
  }
}
```
***********************************************************************************

### signchangekey

Creates and signs a "Change key" operation without checking information and without transfering to the network.
It's usefull for "cold wallets" that are off-line (not synchronized with the network) and only holds private keys

##### Params
- `rawoperations` : HEXASTRING (optional) - If we want to add a sign operation with other previous operations, here we must put previous `rawoperations` result
- `account` : Integer - Account number to change key
- `old_enc_pubkey` or `old_b58_pubkey` : HEXASTRING - Public key (in encoded format or b58 format) of the account
- `new_enc_pubkey` or `new_b58_pubkey` : HEXASTRING - Public key (in encoded format or b58 format) of the new key for the account
- `last_n_operation` : Last value of `n_operation` obtained with an [Account object](#account-object), for example when called to [getaccount](#getaccount)
- `fee`,`payload`,`payload_method`,`pwd` : Same values that calling [changekey](#changekey)

##### Result

Wallet must be unlocked and private key (searched with provided public key) must be in wallet.
No other checks are made (no checks for valid n_operation, valid fee ...)
Returns a [Raw Operations Object](#raw-operations-object)

***********************************************************************************

### signlistaccountforsale
Signs a `List Account For Sale` operation useful for offline, cold wallets.

##### Params
- `account_target` : Account to be listed
- `account_signer` : Account that signs and pays the fee (must have same public key that listed account, or be the same)
- `price`: price account can be purchased for
- `seller_account` : Account that will receive `price` amount on sell
- `new_b58_pubkey`/`new_enc_pubkey`: If used, then will be a private sale
- `locked_until_block` : Block number until this account will be locked (a locked account cannot execute operations while locked)
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password
- `rawoperations` : HEXASTRING with previous signed operations (optional)
- `signer_b58_pubkey`/`signer_enc_pubkey` : The current public key of `account_signer`
- `last_n_operation` : The current n_operation of signer account

##### Result
Returns a [Raw Operations Object](#raw-operations-object)

***********************************************************************************

### signdelistaccountforsale
Signs a List an account for sale (public or private) for cold wallets

##### Params
- `rawoperations` : HEXASTRING with previous signed operations (optional)
- `signer_b58_pubkey`/`signer_enc_pubkey` : The current public key of `account_signer`
- `last_n_operation` : The current n_operation of signer account     

##### Result
Returns a [Raw Operations Object](#raw-operations-object)

***********************************************************************************

### signbuyaccount
Signs a buy operation for cold wallets.

##### Params
- `buyer_account` : Account number of buyer who is purchasing the account
- `account_to_purchase` : Account number being purchased
- `price` : Settlement price of account being purchased
- `seller_account` : Account of seller, receiving payment
- `new_b58_pubkey`/`new_enc_pubkey` : Post-settlement public key in base58 (or hex) format. Only supply one value.
- `amount` : Amount being transferred from buyer_account to seller_account (the settlement). This is a PASCURRENCY value.
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password- `rawoperations` : HEXASTRING with previous signed operations (optional)
- `signer_b58_pubkey`/`signer_enc_pubkey` : The current public key of `buyer_account`
- `last_n_operation` : The current n_operation of buyer account 

##### Result
Returns a [Raw Operations Object](#raw-operations-object)

***********************************************************************************

### signchangeaccountinfo
 Signs a change account info for cold cold wallets.

##### Params
- `account_target` : Account to be delisted
- `account_signer` : Account that signs and pays the fee (must have same public key that target account, or be the same)
- `new_b58_pubkey`/`new_enc_pubkey`: If used, then will change the target account public key
- `new_name`: If used, then will change the target account name
- `new_type`: If used, then will change the target account type
- `fee` : PASCURRENCY - Fee of the operation
- `payload` : HEXASTRING - Payload `item` that will be included in this operation
- `payload_method` : String - Encode type of the item payload  
  - `none` : Not encoded. Will be visible for everybody
  - `dest` (default) : Using Public key of `target` account. Only `target` will be able to decrypt this payload
  - `sender` : Using sender Public key. Only `sender` will be able to decrypt this payload
  - `aes` : Encrypted data using `pwd` param
- `pwd` : String - Used to encrypt payload with `aes` as a `payload_method`. If none equals to empty password
- `rawoperations` : HEXASTRING with previous signed operations (optional)
- `signer_b58_pubkey`/`signer_enc_pubkey` : The current public key of `account_signer`
- `last_n_operation` : The current n_operation of signer account

##### Result
Returns a [Raw Operations Object](#raw-operations-object)

***********************************************************************************

### operationsinfo

Returns information stored in a `rawoperations` param (obtained calling signchangekey or signsendto)

##### Params

- `rawoperations` : HEXASTRING

##### Result

Returns a JSON Array with [Operation Object](#operation-object) items, one for each operation in `rawoperations` param. NOTE: Remember that rawoperations are operations that maybe are not correct

***********************************************************************************

### executeoperations

Executes operations included in `rawopertions` param and transfers to the network. Raw operations can include "Send to" oprations or "Change key" operations.

##### Params

- `rawoperations` : HEXASTRING

##### Result

Returns a JSON Array with [Operation Object](#operation-object) items, one for each operation in `rawoperations` param.  
 
For each [Operation Object](#operation-object) item, if there is an error, param `valid` will be false and param `errors` will show error description. Otherwise, operation is correct and will contain `ophash` param

***********************************************************************************

### nodestatus

Returns information of the Node in a JSON Object 

##### Params

(none)

##### Result
- `ready` : Boolean - Must be true, otherwise Node is not ready to execute operations
- `ready_s` : String - Human readable information about ready or not
- `status_s` : String - Human readable information about node status... Running, downloading blockchain, discovering servers...
- `port` : Integer - Server port
- `locked` : Boolean - True when this wallet is locked, false otherwise
- `timestamp` : Integer - Timestamp of the Node
- `version` : String - Server version
- `netprotocol` : JSON Object
  - `ver` : Integer - Net protocol version
  - `ver_a` : Integer - Net protocol available
- blocks : Integer - Blockchain blocks
- netstats : JSON Object with net information
- ndeservers : JSON Array with servers candidates

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"nodestatus","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "ready":true,
  "ready_s":"",
  "status_s":"Running",
  "port":4004,
  "locked":false,
  "timestamp":1478094204,
  "version":"1.0.9",
  "netprotocol":{
    "ver":2,
    "ver_a":3
  },
  "blocks":27547,
  "netstats":{
    "active":20,
    "clients":17,
    "servers":3,
    "servers_t":3,
    "total":147,
    "tclients":142,
    "tservers":5,
    "breceived":2006753,
    "bsend":1917264
  },
  "nodeservers":[
    {"ip":"46.29.1.190",
    "port":4004,
    "lastcon":1478094198,
    "attempts":0
    },{
    "ip":"144.27.2.76",
    "port":4004,
    "lastcon":1478094198,
    "attempts":0
    },{
    "ip":"118.48.48.94",
    "port":4004,
    "lastcon":1478094198,
    "attempts":0}
  ]
  }
}
```
***********************************************************************************

### encodepubkey

Encodes a public key based on params information

##### Params

- `ec_nid` : Integer
  - 714 = secp256k1
  - 715 = secp384r1
  - 729 = secp283k1
  - 716 = secp521r1
- `x` : HEXASTRING with x value of public key
- `y` : HEXASTRING with y value of public key

##### Result  
  
Returns a HEXASTRING with encoded public key

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"encodepubkey","params":{"ec_nid":714,"x":"0E60B6F76778CFE8678E30369BA7B2C38D0EC93FC3F39E61468E29FEC39F13BF","y":"572EDE3C44CF00FF86AFF651474D53CCBDF86B953F1ECE5FB8FC7BB6FA16F114"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": "CA0220000E60B6F76778CFE8678E30369BA7B2C38D0EC93FC3F39E61468E29FEC39F13BF2000572EDE3C44CF00FF86AFF651474D53CCBDF86B953F1ECE5FB8FC7BB6FA16F114"
}
```
***********************************************************************************

### decodepubkey

Decodes an encoded public key

##### Params
- `enc_pubkey` : HEXASTRING with encoded public key
- `b58_pubkey` String. b58_pubkey is the same value that Application Wallet exports as a public key
  - Note: If use `enc_pubkey` and `b58_pubkey` together and is not the same public key, will return an error

##### Result  

Returns a JSON Object with a "[Public Key Object](#public-key-object)"

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"decodepubkey","params":{"enc_pubkey":"CA0220000E60B6F76778CFE8678E30369BA7B2C38D0EC93FC3F39E61468E29FEC39F13BF2000572EDE3C44CF00FF86AFF651474D53CCBDF86B953F1ECE5FB8FC7BB6FA16F114","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result": {
    "ec_nid":714,
  "x":"0E60B6F76778CFE8678E30369BA7B2C38D0EC93FC3F39E61468E29FEC39F13BF",
  "y":"572EDE3C44CF00FF86AFF651474D53CCBDF86B953F1ECE5FB8FC7BB6FA16F114"
  }
}
```
***********************************************************************************

### payloadencrypt

Encrypt a text "paylad" using "payload_method"

##### Params

- `payload` : HEXASTRING - Text to encrypt in hexadecimal format
- `payload_method` : String - Can be one of:
  - none
  - pubkey : Using a Publick Key. Only owner of this private key will be able to read it. Must provide `enc_pubkey` or `b58_pubkey` param. See [decodepubkey](#decodepubkey) or [encodepubkey](#encodepubkey)
    - `enc_pubkey` : HEXASTRING
    - or
    - `b58_pubkey` : String
  - aes : Using a Password. Must provide `pwd` param
    - `pwd` : String
  
##### Result

Returns a HEXASTRING with encrypted payload

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"payloadencrypt","params":{"payload":"444F444F","payload_method":"aes","pwd":"mypassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":"53616C7465645F5F8312C92E9BFFD6068ADA9F2F7CEA90505B50CE2CAE995C28"
}
```
***********************************************************************************
  
### payloaddecrypt

Returns a HEXASTRING with decrypted text (a payload) using private keys in the wallet or a list of Passwords (used in "aes" encryption)

##### Params

- `payload`:HEXASTRING - Encrypted data
- `pwds`: JSON Array of Strings (optional)

##### Result

- `result` : Boolean 
- `enc_payload` : HEXASTRING - Same value than param `payload` sent
- `unenc_payload` : String - Unencoded value in readable format (no HEXASTRING)
- `unenc_hexpayload` : HEXASTRING - Unencoded value in hexastring
- `payload_method` : String - "key" or "pwd"
- `enc_pubkey` : HEXASTRING - Encoded public key used to decrypt when method = "key"
- `pwd` : String - String value used to decrypt when method = "pwd"  

Note:
- If using one of private keys is able to decrypt `payload` then returns value "key" in `payload_method` and `enc_pubkey` contains encoded public key in HEXASTRING
- If using one of passwords to decrypt `payload` then returns value "pwd" in `payload_method` and `pwd` contains password used

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"payloaddecrypt","params":{"payload":"53616C7465645F5F8312C92E9BFFD6068ADA9F2F7CEA90505B50CE2CAE995C28","pwds":["mypassword","otherpwd"]},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "result":true,
  "enc_payload":"53616C7465645F5F8312C92E9BFFD6068ADA9F2F7CEA90505B50CE2CAE995C28",
  "unenc_payload":"DODO",
  "payload_method":"pwd",
  "pwd":"mypassword"
  }
}
```
***********************************************************************************

### getconnections

Returns a JSON Array with [Connection Objects](#connection-object)

### addnewkey

Creates a new Private key and sotres it on the wallet, returning an enc_pubkey value

##### Params
- `ec_nid` : Integer - One of 
  - 714 = secp256k1
  - 715 = secp384r1
  - 729 = secp283k1
  - 716 = secp521r1
- `name` : String - Name to alias this new private key

##### Result

Returns a JSON Object with a "[Public Key Object](#public-key-object)"

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"addnewkey","params":{"ec_nid":729,"name":"My new key"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":"D902240006ECEFF2AFDAF182F77BCC0E1316C99680C5221BE08A3AB58A43C52B298057FCE594CD33240003AEA36BBB9A82DFECA7D30CE33503FED96CC1AA16AF5F80BA0836CD4AF28F4716253237"
}
```
***********************************************************************************

### lock

Locks the Wallet if it has a password, otherwise wallet cannot be locked

##### Params

(none)

##### Result

Returns a Boolean indicating if Wallet is locked. If false that means that Wallet has an empty password and cannot be locked

***********************************************************************************

### unlock

Unlocks a locked Wallet using "pwd" param

##### Params
- `pwd` : String;

##### Result

Returns a Boolean indicating if Wallet is unlocked after using `pwd` password

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"unlock","params":{"pwd":"mypassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":true
}
```
***********************************************************************************

### setwalletpassword

Changes the password of the Wallet. (Must be previously unlocked)
Note: If `pwd` param is empty string, then wallet will be not protected by password

##### Params

- `pwd` : String - New password

##### Result

Returns a Boolean if Wallet password changed with new `pwd` password

##### Example  

Valid example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"setwalletpassword","params":{"pwd":"myNEWpassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":true
}
```

Error example (Wallet password protected)
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"setwalletpassword","params":{"pwd":"myNEWpassword"},"id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "error":{
    "code":1015,
  "message":"Wallet is password protected. Unlock first"
  }
}
```
***********************************************************************************

### stopnode

Stops the node and the server. Closes all connections

##### Params

(none)

##### Result

Boolean "true"

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"stopnode","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":true
}
```
***********************************************************************************

### startnode

Starts the node and the server. Starts connection process

##### Params

(none)

##### Result

Boolean "true"

##### Example
```js
// Request
curl -X POST --data '{"jsonrpc":"2.0","method":"startnode","id":123}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":true
}
```
***********************************************************************************

### signmessage

Signs a digest message using a public key

##### Params

- `digest` : HEXASTRING with the message to sign
- `b58_pubkey` or `enc_pubkey` : HEXASTRING with the public key that will use to sign `digest` data

##### Result
(False on error)
- `digest`  : HEXASTRING with the message to sign
- `enc_pubkey` : HESATRING with the public key that used to sign "digest" data
- `signature` : HEXASTRING with signature

***********************************************************************************

### verifysign

Verify if a digest message is signed by a public key

##### Params

- `digest` : HEXASTRING with the message to sign
- `b58_pubkey` or `enc_pubkey` : HEXASTRING with the public key that will use to sign `digest` data
- `signature` : HEXASTRING returned by "signmessage" call

##### Result
(False on error)
- `digest`  : HEXASTRING with the message to sign
- `enc_pubkey` : HESATRING with the public key that used to sign "digest" data
- `signature` : HEXASTRING with signature

***********************************************************************************

### multioperationaddoperation

Adds operations to a multioperation (or creates a new multioperation and adds new operations)

##### Params
- `rawoperations` : HEXASTRING (optional) with previous multioperation. If is valid and contains a single  multiopertion will add operations to this one, otherwise will generate a NEW MULTIOPERATION
- `auto_n_operation` : Boolean - Will fill n_operation (if not provided). Only valid if wallet is ONLINE (no cold wallets)
- `senders` : ARRAY of objects that will be Senders of the multioperation
  - `account` : Integer
  - `n_operation` : Integer (optional) - if not provided, will use current safebox n_operation+1 value (on online wallets)
  - `amount` : PASCURRENCY in positive format
  - `payload` : HEXASTRING
- `receivers` : ARRAY of objects that will be Receivers of the multioperation
  - `account` : Integer
  - `amount` : PASCURRENCY in positive format
  - `payload` : HEXASTRING
- `changesinfo` : ARRAY of objects that will be accounts executing a changing info
  - `account` : Integer
  - `n_operation` : Integer (optional) - if not provided, will use current safebox n_operation+1 value (on online wallets)
  - `new_b58_pubkey`/`new_enc_pubkey`: (optional) If provided will update Public key of "account"
  - `new_name` : STRING (optional) If provided will change account name
  - `new_type` : Integer (optional) If provided will change account type

##### Result

If success will return a "MultiOperation Object"

##### Example
```js
// Request with 2 senders and 2 receivers
curl -X POST --data '{"jsonrpc":"2.0","id":"100","method":"multioperationaddoperation","params":{"senders":[{"account":15,"amount":12.3456},{"account":20,"amount":3.0001}],"receivers":[{"account":21,"amount":10.0099},{"account":22,"amount":11.9999}]}}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "rawoperations": "0100000009000000030002000F00000040E20100000000000100000000000000000014000000317500000000000001000000000000000000020016000000BFD4010000000000000015000000038701000000000000000000",
    "senders":[
      {"account":15,"n_operation":1,"amount":-12.3456,"payload":""},
      {"account":20,"n_operation":1,"amount":-3.0001,"payload":""}],
    "receivers":[
      {"account":22,"amount":11.9999,"payload":""},
      {"account":21,"amount":10.0099,"payload":""}],
    "changers":[],
    "amount":22.0098,
    "fee":-6.6641,
    "senders_count":2,
    "receivers_count":2,
    "changesinfo_count":0,
    "signed_count":0,
    "not_signed_count":2,
    "signed_can_execute":false}
}
```

***********************************************************************************

### multioperationsignoffline

This method will sign a Multioperation found in a "rawoperations", must provide all n_operation info of each signer because can work in cold wallets

##### Params

- `rawoperations` : HEXASTRING with 1 multioperation in Raw format
- `accounts_and_keys` : ARRAY of objects with info about accounts and public keys to sign
  - `account` : Integer
  - `b58_pubkey` or `enc_pubkey` : HEXASTRING with the public key of the account

##### Result

If success will return a "MultiOperation Object"

##### Example
```js
// Request sending account 15 public key to sign a multioperation
curl -X POST --data '{"jsonrpc":"2.0","id":"100","method":"multioperationsignoffline","params":{"rawoperations":"0100000009000000030002000F00000040E20100000000000100000000000000000014000000317500000000000001000000000000000000020016000000BFD4010000000000000015000000038701000000000000000000","accounts_and_keys":[{"account":15,"enc_pubkey":"CA0220009FE05F1E0267A271E08BA4FE8126091CC0A5F9ED40F14AD402327D1C99F8712F2000733D891E0297176524C303F548B0F6789396780C816459281E12797CDD66E90F"}]}}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "rawoperations": "0100000009000000030002000F00000040E2010000000000010000000000200074EFFFFCA3D4059C1B1B4A94B1320896B9DBFD8FBDB62274AA1DECF66ABE36A120004CE0374FFBFBF467985E6D9AB52A7DE34CB6E73F76CDBE5D9CC5394AE47D97B114000000317500000000000001000000000000000000020016000000BFD4010000000000000015000000038701000000000000000000",
    "senders":[
      {"account":15,"n_operation":1,"amount":-12.3456,"payload":""},
      {"account":20,"n_operation":1,"amount":-3.0001,"payload":""}],
    "receivers":[
      {"account":22,"amount":11.9999,"payload":""},
      {"account":21,"amount":10.0099,"payload":""}],
    "changers":[],
    "amount":22.0098,
    "fee":-6.6641,
    "senders_count":2,
    "receivers_count":2,
    "changesinfo_count":0,
    "signed_count":1,
    "not_signed_count":1,
    "signed_can_execute":false}
}
```

***********************************************************************************

### multioperationsignonline

This method will sign a Multioperation found in a "rawoperations" based on current safebox state public keys

##### Params

- `rawoperations` : HEXASTRING with 1 multioperation in Raw format

##### Result

If success will return a "MultiOperation Object"

##### Example
```js
// Request sending a multiopration to be signed in an online wallet
curl -X POST --data '{"jsonrpc":"2.0","id":"100","method":"multioperationsignonline","params":{"rawoperations":"0100000009000000030002000F00000040E20100000000000100000000000000000014000000317500000000000001000000000000000000020016000000BFD4010000000000000015000000038701000000000000000000"}}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "rawoperations": "0100000009000000030002000F00000040E2010000000000010000000000200042A4A3DF2AE8A2CBB57B3E70505E73F3C982B6EE59FB1D2402A2AF7079BDA0A52000357D428B34D2166E7BB96DE3A61557987B41084B4D69829F0844E6395E4B4192140000003175000000000000010000000000200053BBF3011FB5DDC72CD027A7CABF6A86B802DD89A28B107DE2A10F1073BB4D6320000E5A21111619A544034548BF79526745C4EEBA5972E115E548E7672071BAE818020016000000BFD4010000000000000015000000038701000000000000000000",
    "senders":[
      {"account":15,"n_operation":1,"amount":-12.3456,"payload":""},
      {"account":20,"n_operation":1,"amount":-3.0001,"payload":""}],
    "receivers":[
      {"account":22,"amount":11.9999,"payload":""},
      {"account":21,"amount":10.0099,"payload":""}],
    "changers":[],
    "amount":22.0098,
    "fee":-6.6641,
    "senders_count":2,
    "receivers_count":2,
    "changesinfo_count":0,
    "signed_count":2,
    "not_signed_count":0,
    "signed_can_execute":true}
}
```


***********************************************************************************

### operationsdelete

This method will delete an operation included in a Raw operations object

##### Params

- `rawoperations` : HEXASTRING with Raw Operations Object
- `index` : Integer index to be deleted (from  0..count-1 )

##### Result

If success will return a "Raw Operations Object"
- `rawoperations` : HEXASTRING with operations in Raw format
- `operations` : Integer
- `amount` : PASCURRENCY
- `fee` : PASCURRENCY  

##### Example
```js
// To delete a Raw operations object that has only 1 operation (will result in a NULL operation object)
curl -X POST --data '{"jsonrpc":"2.0","id":"100","method":"operationsdelete","params":{"rawoperations":"0100000009000000030002000F00000040E20100000000000100000000000000000014000000317500000000000001000000000000000000020016000000BFD4010000000000000015000000038701000000000000000000","index":0}}' http://localhost:4003

// Result
{
  "jsonrpc":"2.0",
  "id":123,
  "result":{
    "operations":0,
    "amount":0,
    "fee":0,
    "rawoperations": "00000000"}
}
```

