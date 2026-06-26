---
title: Token Authentication Based on JWT
pubDate: 2026-06-26
description: A way to verify identity
category: Technology
image: ""
draft: false
slugId: momo/jwt
---

# Token-Based Authentication

## 1.1 Introduction

Many externally exposed APIs need to identify the requester and decide whether the requested resource can be returned. A token is a mechanism for identity verification. Based on this mechanism, the application does not need to retain user authentication information or session state on the server side. It enables stateless, distributed web application authorization, facilitating application scalability.

## 1.2 Process Description

![token](./jwt.png)
The following is the complete business process of an API gateway using the JWT authentication plugin. We describe each step in detail below:

The client sends a request to the API gateway with a token included.

The API gateway verifies the token in the request using the public key configured in the plugin. After successful verification, the request is forwarded to the backend service.

The backend service processes the request and returns a response.

The API gateway returns the backend service's response to the client.

Throughout this process, the API gateway uses the token authentication mechanism to empower users to authorize API access using their own user system. Next, we will introduce JSON Web Token (JWT), the structured token used by the API gateway for token authentication.

# JWT

## 1.1 Introduction

JSON Web Token (JWT) is an open standard based on JSON (RFC 7519) for passing claims between parties in a network application environment. JWT can be used as a standalone identity verification token, containing information such as user identifier, user role, and permissions, facilitating resource access from resource servers. It can also include additional claim information essential for other business logic, and is especially suitable for distributed site login scenarios.

## 1.2 JWT Structure

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```
As shown in the example above, a JWT is simply a string composed of three parts:

Header

Payload

Signature

### Header

The JWT header carries two pieces of information:

The token type, which is JWT here.

The algorithm used for signing.

A complete header looks like the following JSON:

```json
{
  'typ': 'JWT',
  'alg': 'HS256'
}
```
The header is then Base64 encoded (this encoding can be symmetrically decoded) to form the first part.

```text
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9
```
### Payload

The payload is where the effective information is stored. The definitions are as follows:

```text
iss: Token issuer. Indicates who created the token. This claim is a string.
sub: Subject Identifier. An identifier for the end-user provided by the issuer, unique within the issuer's context, up to 255 ASCII characters, case-sensitive.
aud: Audience(s). The intended audience of the token. A case-sensitive array of strings.
exp: Expiration time. The timestamp after which the token becomes invalid. This claim is an integer representing seconds since January 1, 1970.
iat: Issued at time. The time the token was issued. This claim is an integer representing seconds since January 1, 1970.
jti: JWT ID. A unique identifier for the token. The value of this claim must be unique across all tokens created by the issuer. To prevent conflicts, it is usually a cryptographically random value. This effectively adds a random entropy component that cannot be obtained by an attacker to the structured token, helping prevent token guessing attacks and replay attacks.
```
Custom fields needed by the user system can also be added. For example, the following adds a "name" field for the user nickname:

```json
{
  "sub": "1234567890",
  "name": "John Doe"
}
```
This is then Base64 encoded to obtain the second part of the JWT:

```text
JTdCJTBBJTIwJTIwJTIyc3ViJTIyJTNBJTIwJTIyMTIzNDU2Nzg5MCUyMiUyQyUwQSUyMCUyMCUyMm5hbWUlMjIlM0ElMjAlMjJKb2huJTIwRG9lJTIyJTBBJTdE
```
### Signature

To create this part, take the Base64-encoded header and the Base64-encoded payload, concatenate them with a '.' in between, and then sign the resulting string using the algorithm declared in the header ($secret represents the user's private key). This forms the third part of the JWT.

```text
// javascript
var encodedString = base64UrlEncode(header) + '.' + base64UrlEncode(payload);
var signature = HMACSHA256(encodedString, '$secret');
```
Concatenate these three parts with '.' to form the complete JWT string shown at the beginning.

## 1.3 Authorization Scope and Expiry

The API gateway considers that a token issued by a user has the right to access all APIs within the entire group that are bound with the JWT plugin. If finer-grained permission management is required, the backend service itself needs to unwrap the token for permission verification. The API gateway will verify the exp field in the token. Once this field expires, the API gateway considers the token invalid and rejects the request directly. The expiration time value must be set, and it must be less than 7 days.

## 1.4 Characteristics of JWT

1. JWT is not encrypted by default. Do not write secret data into a JWT.

2. JWT can be used not only for authentication but also for exchanging information. Effective use of JWT can reduce the number of times the server queries the database. The biggest drawback of JWT is that since the server does not save session state, it is impossible to revoke a token or change its permissions during its lifetime. In other words, once a JWT is issued, it remains valid until it expires, unless the server deploys additional logic.

3. JWT itself contains authentication information. Once leaked, anyone can gain all the privileges of that token. To reduce theft, the validity period of a JWT should be set relatively short. For some more important permissions, the user should be re-authenticated during use.

4. To reduce theft, JWT should not be transmitted in clear text over the HTTP protocol; the HTTPS protocol must be used.