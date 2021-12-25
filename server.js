const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const App = express();

// App.use(express.static('public'));

const LIMIT = 100;
const AllData = [];
const Users = [];
const Sum = [];
const step = Math.round(100 / LIMIT);


async function getLastBlock(callback)
{
   
    let progress = 0;
    const res = await fetch('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber');
    const Data = await res.json();

    let blockNumber = parseInt(Data.result);

    console.log(blockNumber);

    if(isNaN(blockNumber))
    {
        getLastBlock();
        return;
    }
        
    recurcyBlock(blockNumber, blockNumber - LIMIT);

    async function recurcyBlock(blockNumber, end)
    {
        if(blockNumber == end)
        {
            calcSum();
            return;
        }

        const Transactions = await getTransactions(blockNumber);

        if(Transactions != undefined)
            AllData.push(...Transactions);

        progress+=step;

        console.log(`${progress}%`);

        blockNumber--;

        recurcyBlock(blockNumber, end);
    }


    async function getTransactions(blockNumber)
    {
        const res = await fetch(`https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=CVP9SCG9KAKHIPEP4RG22D43JC1TIVPUIJ`);

        const Data = await res.json();
        
        return  Data.result.transactions;
    }

    function calcSum()
    {
        console.log('Filtered data please wait...');

        AllData.forEach((elem) => {

            const Arr = AllData.filter((item) => item.from == elem.from && item.to == elem.to);

            let total = 0;

            Arr.forEach((el) => {
                total += parseInt(el.value);
            })

            Users.push({ wallet: elem.from, total: total });
            Sum.push(total);
        })

        console.log('Filtered min max please wait...');

        let max = Sum[0];
        
        Sum.forEach((elem) => {
            max = Math.max(max, elem);
        });

        console.log('Find user please wait...');
        const User = Users.find((elem) => elem.total == max);

        console.log('Done!');
        console.log(`Wallet: ${User.wallet}`);

        callback(User.wallet);

    }

}

App.get('/', function(req, res) {

    getLastBlock((wallet) => {
        res.send(wallet);
    });

});

App.listen(5000, 'localhost', () => {
    console.log('Server running...');
});