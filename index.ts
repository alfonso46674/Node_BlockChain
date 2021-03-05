import * as crypto from 'crypto';
import { stringify } from 'node:querystring';



class Block{
    //one time use data
    public nonce = Math.round(Math.random() * 9999999);
    
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

        //create a signature verification
        const verifier = crypto.createVerify('SHA256');
        //pass the transaction to the verifier
        verifier.update(transaction.toString());

        //verify the signature with the public key
        const isValid = verifier.verify(senderPublicKey,signature);

        if(isValid){
            //create new block with the previous block hash, and the current transaction
            const newBlock = new Block(transaction, this.lastBlock.hash);
            //Proof of Work
            this.mine(newBlock.nonce);
            //push new block to the chain
            this.chain.push(newBlock);
        }
    }

    //attempt to find the nonce value of the current Block that wants to be verified in the chain
    //Proof of Work
    mine(nonce:number){
        let solution = 1;
        console.log("Mining....");

        while(true){
            //create hash with 128 bits algorithm
            const hash = crypto.createHash('MD5');
            hash.update((nonce + solution).toString()).end();

            const attempt = hash.digest('hex');

            //create hashes until one starts with 0000, that will be the solution
            if (attempt.substr(0,4) === '0000'){
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution += 1;
        }
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