var curve25519 = require("../curve25519");
var chai = require("chai");
var crypto = require("crypto");

var assert = chai.assert;

var areArrayBuffersEqual = function(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    var av = new Uint8Array(a);
    var bv = new Uint8Array(b);
    for (var i = 0; i < a.byteLength; i++) {
        if (av[i] !== bv[i]) {
            return false;
        }
    }
    return true;
};

var toArrayBuffer = function(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
};

describe("curve25519", function() {
    describe("generateKeyPair", function() {
        it("returns an object containing a public and private key", function() {
            var randomBytes = toArrayBuffer(crypto.randomBytes(32));
            var keyPair = curve25519.generateKeyPair(randomBytes);
            assert.instanceOf(keyPair.public, ArrayBuffer);
            assert.instanceOf(keyPair.private, ArrayBuffer);
            assert.equal(keyPair.public.byteLength, 32);
            assert.equal(keyPair.private.byteLength, 32);
        });
    });
    describe("calculateAgreement", function() {
        it("calculates an agreement", function() {
            var randomBytes1 = toArrayBuffer(crypto.randomBytes(32));
            var randomBytes2 = toArrayBuffer(crypto.randomBytes(32));
            var keyPair1 = curve25519.generateKeyPair(randomBytes1);
            var keyPair2 = curve25519.generateKeyPair(randomBytes2);
            var secret1 = curve25519.calculateAgreement(keyPair1.public, keyPair2.private);
            var secret2 = curve25519.calculateAgreement(keyPair2.public, keyPair1.private);
            assert.instanceOf(secret1, ArrayBuffer);
            assert.ok(areArrayBuffersEqual(secret1, secret2));
        });
        it("computes the correct shared secret", function() {
            var alicePublic = new Uint8Array([0x1b, 0xb7, 0x59, 0x66,
                0xf2, 0xe9, 0x3a, 0x36, 0x91,
                0xdf, 0xff, 0x94, 0x2b, 0xb2,
                0xa4, 0x66, 0xa1, 0xc0, 0x8b,
                0x8d, 0x78, 0xca, 0x3f, 0x4d,
                0x6d, 0xf8, 0xb8, 0xbf, 0xa2,
                0xe4, 0xee, 0x28]).buffer;

            var alicePrivate = new Uint8Array([0xc8, 0x06, 0x43, 0x9d, 0xc9,
                0xd2, 0xc4, 0x76, 0xff, 0xed,
                0x8f, 0x25, 0x80, 0xc0, 0x88,
                0x8d, 0x58, 0xab, 0x40, 0x6b,
                0xf7, 0xae, 0x36, 0x98, 0x87,
                0x90, 0x21, 0xb9, 0x6b, 0xb4,
                0xbf, 0x59]).buffer;

            var bobPublic = new Uint8Array([0x65, 0x36, 0x14, 0x99,
                0x3d, 0x2b, 0x15, 0xee, 0x9e,
                0x5f, 0xd3, 0xd8, 0x6c, 0xe7,
                0x19, 0xef, 0x4e, 0xc1, 0xda,
                0xae, 0x18, 0x86, 0xa8, 0x7b,
                0x3f, 0x5f, 0xa9, 0x56, 0x5a,
                0x27, 0xa2, 0x2f]).buffer;

            var bobPrivate = new Uint8Array([0xb0, 0x3b, 0x34, 0xc3, 0x3a,
                0x1c, 0x44, 0xf2, 0x25, 0xb6,
                0x62, 0xd2, 0xbf, 0x48, 0x59,
                0xb8, 0x13, 0x54, 0x11, 0xfa,
                0x7b, 0x03, 0x86, 0xd4, 0x5f,
                0xb7, 0x5d, 0xc5, 0xb9, 0x1b,
                0x44, 0x66]).buffer;

            var shared = new Uint8Array([0x32, 0x5f, 0x23, 0x93, 0x28,
                0x94, 0x1c, 0xed, 0x6e, 0x67,
                0x3b, 0x86, 0xba, 0x41, 0x01,
                0x74, 0x48, 0xe9, 0x9b, 0x64,
                0x9a, 0x9c, 0x38, 0x06, 0xc1,
                0xdd, 0x7c, 0xa4, 0xc4, 0x77,
                0xe6, 0x29]).buffer;

            var actualShared1 = curve25519.calculateAgreement(alicePublic, bobPrivate);
            var actualShared2 = curve25519.calculateAgreement(bobPublic, alicePrivate);

            assert.ok(areArrayBuffersEqual(shared, actualShared1));
            assert.ok(areArrayBuffersEqual(shared, actualShared2));
        });
    });
    var message = new Uint8Array([
        0x05, 0xed, 0xce, 0x9d, 0x9c,
        0x41, 0x5c, 0xa7, 0x8c, 0xb7,
        0x25, 0x2e, 0x72, 0xc2, 0xc4,
        0xa5, 0x54, 0xd3, 0xeb, 0x29,
        0x48, 0x5a, 0x0e, 0x1d, 0x50,
        0x31, 0x18, 0xd1, 0xa8, 0x2d,
        0x99, 0xfb, 0x4a
    ]).buffer;
    var signature = new Uint8Array([
        0x5d, 0xe8, 0x8c, 0xa9, 0xa8,
        0x9b, 0x4a, 0x11, 0x5d, 0xa7,
        0x91, 0x09, 0xc6, 0x7c, 0x9c,
        0x74, 0x64, 0xa3, 0xe4, 0x18,
        0x02, 0x74, 0xf1, 0xcb, 0x8c,
        0x63, 0xc2, 0x98, 0x4e, 0x28,
        0x6d, 0xfb, 0xed, 0xe8, 0x2d,
        0xeb, 0x9d, 0xcd, 0x9f, 0xae,
        0x0b, 0xfb, 0xb8, 0x21, 0x56,
        0x9b, 0x3d, 0x90, 0x01, 0xbd,
        0x81, 0x30, 0xcd, 0x11, 0xd4,
        0x86, 0xce, 0xf0, 0x47, 0xbd,
        0x60, 0xb8, 0x6e, 0x88
    ]).buffer;
    var publicKey = new Uint8Array([
        0xab, 0x7e, 0x71, 0x7d,
        0x4a, 0x16, 0x3b, 0x7d, 0x9a,
        0x1d, 0x80, 0x71, 0xdf, 0xe9,
        0xdc, 0xf8, 0xcd, 0xcd, 0x1c,
        0xea, 0x33, 0x39, 0xb6, 0x35,
        0x6b, 0xe8, 0x4d, 0x88, 0x7e,
        0x32, 0x2c, 0x64
    ]).buffer;
    describe("verifySignature", function() {
        it("returns true for a valid signature", function() {
            assert.ok(curve25519.verifySignature(publicKey, message, signature));
        });
        it("returns false for an invalid signature", function() {
            var badSignature = new Uint8Array(signature);
            badSignature[0] |= 0xFF;
            assert.notOk(curve25519.verifySignature(publicKey, message, signature));
        });
    });
    describe("sign", function() {
        it("returns true for a known valid signature", function() {
            var privateKey = new Uint8Array([
                0xc0, 0x97, 0x24, 0x84, 0x12,
                0xe5, 0x8b, 0xf0, 0x5d, 0xf4,
                0x87, 0x96, 0x82, 0x05, 0x13,
                0x27, 0x94, 0x17, 0x8e, 0x36,
                0x76, 0x37, 0xf5, 0x81, 0x8f,
                0x81, 0xe0, 0xe6, 0xce, 0x73,
                0xe8, 0x65
            ]).buffer;
            var actualSignature = curve25519.sign(privateKey, message);
            assert.ok(curve25519.verifySignature(publicKey, message, actualSignature));
        });
        for(var i = 0; i < 10; i++) {
            it("returns true for a random valid signature " + i, function() {
                var randomBytes = toArrayBuffer(crypto.randomBytes(32));
                var signingKeyPair = curve25519.generateKeyPair(randomBytes);
                var signature = curve25519.sign(signingKeyPair.private, message);
                assert.ok(curve25519.verifySignature(signingKeyPair.public, message, signature));
            });
        }
    });
});
