import pkg from "../package.json" assert { type: "json" };

// https://fsymbols.com/generators/carty/
export function banner()  {
    let text =`

    ███████╗██████╗░░█████╗░██████╗░░█████╗░  ░█████╗░██████╗░██╗
    ██╔════╝██╔══██╗██╔══██╗╚════██╗██╔══██╗  ██╔══██╗██╔══██╗██║
    █████╗░░██████╔╝██║░░╚═╝░░███╔═╝██║░░██║  ███████║██████╔╝██║
    ██╔══╝░░██╔══██╗██║░░██╗██╔══╝░░██║░░██║  ██╔══██║██╔═══╝░██║
    ███████╗██║░░██║╚█████╔╝███████╗╚█████╔╝  ██║░░██║██║░░░░░██║
    ╚══════╝╚═╝░░╚═╝░╚════╝░╚══════╝░╚════╝░  ╚═╝░░╚═╝╚═╝░░░░░╚═╝

`
    text += `   🚀 ${pkg.description} (v${pkg.version})

    Documentation: ${pkg.homepage}

    HTTP GET
        /supply?address=<Contract address>&block=<Optional - Block number>
        /contract?address=<Contract address>
        /balance?wallet=<Wallet address>&address=<Optional - Contract address>&block=<Optional - Block number>
`
    return text;
}