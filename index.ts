import * as crypto from 'crypto';



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
    constructor() {}

}