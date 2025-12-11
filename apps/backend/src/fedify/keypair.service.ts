import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyPair } from './entities/key-pair.entity';
import { generateCryptoKeyPair, exportJwk } from '@fedify/fedify';

@Injectable()
export class KeypairService {
  constructor(
    @InjectRepository(KeyPair)
    private keypairRepository: Repository<KeyPair>,
  ) {}

  /**
   * 액터의 키 쌍 조회
   */
  async getKeyPairs(actorId: string): Promise<CryptoKeyPair[]> {
    const keyPairs = await this.keypairRepository.find({
      where: { actor_id: actorId },
    });

    // DB에 저장된 JWK를 CryptoKey로 변환
    const cryptoKeyPairs: CryptoKeyPair[] = [];

    for (const kp of keyPairs) {
      try {
        const privateKeyJwk = JSON.parse(kp.private_key);
        const publicKeyJwk = JSON.parse(kp.public_key);

        // JWK를 CryptoKey로 import
        const algorithm =
          kp.type === 'RSASSA-PKCS1-v1_5'
            ? { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
            : { name: 'Ed25519' };

        const privateKey = await crypto.subtle.importKey(
          'jwk',
          privateKeyJwk,
          algorithm,
          true,
          ['sign'],
        );

        const publicKey = await crypto.subtle.importKey(
          'jwk',
          publicKeyJwk,
          algorithm,
          true,
          ['verify'],
        );

        cryptoKeyPairs.push({ privateKey, publicKey });
      } catch (error) {
        console.error(`Failed to import key pair (type: ${kp.type}):`, error);
      }
    }

    return cryptoKeyPairs;
  }

  /**
   * 액터의 키 쌍 생성 (없으면)
   */
  async ensureKeyPairs(actorId: string): Promise<CryptoKeyPair[]> {
    // 이미 키가 있는지 확인
    const existingKeys = await this.keypairRepository.find({
      where: { actor_id: actorId },
    });

    if (existingKeys.length > 0) {
      return this.getKeyPairs(actorId);
    }

    // 없으면 생성
    console.log(`Generating key pairs for actor: ${actorId}`);

    // RSA 키 쌍 생성
    const rsaKeyPair = await generateCryptoKeyPair('RSASSA-PKCS1-v1_5');
    const rsaPrivateJwk = await exportJwk(rsaKeyPair.privateKey);
    const rsaPublicJwk = await exportJwk(rsaKeyPair.publicKey);

    await this.keypairRepository.save({
      actor_id: actorId,
      type: 'RSASSA-PKCS1-v1_5',
      private_key: JSON.stringify(rsaPrivateJwk),
      public_key: JSON.stringify(rsaPublicJwk),
    });

    // Ed25519 키 쌍 생성
    const ed25519KeyPair = await generateCryptoKeyPair('Ed25519');
    const ed25519PrivateJwk = await exportJwk(ed25519KeyPair.privateKey);
    const ed25519PublicJwk = await exportJwk(ed25519KeyPair.publicKey);

    await this.keypairRepository.save({
      actor_id: actorId,
      type: 'Ed25519',
      private_key: JSON.stringify(ed25519PrivateJwk),
      public_key: JSON.stringify(ed25519PublicJwk),
    });

    console.log(`Key pairs generated for actor: ${actorId}`);

    return [rsaKeyPair, ed25519KeyPair];
  }

  /**
   * 모든 키 삭제 (테스트/개발용)
   */
  async deleteAllKeys(actorId: string): Promise<void> {
    await this.keypairRepository.delete({ actor_id: actorId });
  }
}
