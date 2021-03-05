import * as crypto from 'crypto';
import { stringify } from 'node:querystring';



class Block{
    constructor(
        public transaction: Transaction,
        public prevHash: string,
        public timestamp = Date.now(),
    ){}

    get hash(){
        //Stringify the object itself
        const str = JSON.stringify(this);
        
        //Create a hash value with the SHA256 Encryption
        const hash = crypto.createHash('SHA256');
        
        //hash the stringified object
        hash.update(str).end();

        //return as a hexadecimal string
        return hash.digest('hex');

    }
}

class Chain{
    //there can only be one chain; Singleton instance
    public static instance = new Chain();

    chain: Block[];

    constructor(){
        //genesis block
        this.chain = [new Block(new Transaction(200,'genesis','John'),'')];
    }

    get lastBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer){

        //create new block with the previous block hash, and the current transaction
        const newBlock = new Block(transaction, this.lastBlock.hash);
        //push new block to the chain
        this.chain.push(newBlock);
    }
}

class Transaction{
    constructor(
        public amount: number,
        public payer: string, // public key
        public payee: string, // public key
    ) {}

    toString(){
        return JSON.stringify(this);
    }
    
      
}

class Wallet {
    public publicKey: string; // for receiving money
    public privateKey: string; //for spending money

    constructor() {
        const keypair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
          });

        this.publicKey = keypair.publicKey;
        this.privateKey = keypair.privateKey;
    }

    sendMoney(payeePublicKey: string, amount: number){
        //create a transaction to send money from the current wallet to another person
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

        //create a signature using the transaction data as the value
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();

        //sign the signature with the private key, as a one time password that can be verified with the public key
        const signature = sign.sign(this.privateKey);
        
        //Add new block to blockchain
        Chain.instance.addBlock(transaction,this.publicKey, signature);

    }

}