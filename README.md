```
bun install
bun run dev
```

```
open http://localhost:8080
```

    ███████╗██████╗░░█████╗░██████╗░░█████╗░  ░█████╗░██████╗░██╗
    ██╔════╝██╔══██╗██╔══██╗╚════██╗██╔══██╗  ██╔══██╗██╔══██╗██║
    █████╗░░██████╔╝██║░░╚═╝░░███╔═╝██║░░██║  ███████║██████╔╝██║
    ██╔══╝░░██╔══██╗██║░░██╗██╔══╝░░██║░░██║  ██╔══██║██╔═══╝░██║
    ███████╗██║░░██║╚█████╔╝███████╗╚█████╔╝  ██║░░██║██║░░░░░██║
    ╚══════╝╚═╝░░╚═╝░╚════╝░╚══════╝░╚════╝░  ╚═╝░░╚═╝╚═╝░░░░░╚═╝

    text +=` 🚀 ${pkg.description} (${pkg.version})

    Github: ${pkg.repository}

    HTTP GET
        /supply?address=<Contract address>&block=<Optional - Block number>
        /contract?address=<Contract address>
        /balance?wallet=<Wallet address>&address=<Optional - Contract address>&block=<Optional - Block number>
