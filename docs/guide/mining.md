# Guide to Mining PascalCoin

Mining PascalCoin is easy to do with almost any computer. PascalCoin can be mined on Intel and AMD 64-bit CPUs and Nvidia GPUs (currently) using Windows 7/8/10 or Linux. This guide will get you setup to solo mine (mine to your own wallet).

Requirements:
  - PascalCoin Wallet
  - RHMiner or PascalCoinMiner

It should be noted that RHMiner includes a 1% developer fee to help offset development and maintenance costs. The developer fee is collected by the developer, NOT the PascalCoin organization. 
	
**RHMiner developer fee information**

The default donation is 1%. The donation is hardcoded in the binaries downloadable on github. This is to help compensate the time it took to R&D, develop, stabilize and optimize this miner and for the upcoming bug fixes and optimizations. 
	
To disable this donation, download and compile locally then use the `-devfee` option with chosen donation percentage. "0" will disable the donation.

**For direct donations:**

Pascal wallet - 529692-23

Bitcoin address - 19GfXGpRJfwcHPx2Nf8wHgMps8Eat1o4Jp

If you don't already have the Pascal wallet installed and setup, please see the [Getting Started Guide](/get_started).

## Prepare Your Wallet for Mining

1. In the PascalCoin wallet, go to Project Menu, then Options and set the miner name to anything less than 26 characters.
2. Check the box "JSON-RPC Server Miner (TCP/IP, no HTTP)"
3. Make sure the JSON-RPC Port value is set (Default 4009)
4. Under "Miner Server Private Key", select "Always mine with this key" and select the key you created or any secp256k1 key.
5. Click the button with green check mark to save the settings.

Some tips for mining in Windows:

 - Disable automatic Windows updates
 - Change the power setting to high performance and disable the Sleep function
 - In advanced system settings/performance, select "Adjust for best performance"

## Download RHMiner

Go to the releases page of the RHMiner project here: [RHMiner releases](https://github.com/polyminer1/rhminer/releases) and select either the matching Windows or Linux version of the miner.
	
 - &raquo; **CPU only** - `rhminer.version.operating-system.CPU.zip`
 - &raquo; **Nvidia Kepler** - `rhminer.version.operating-system.Kepler.zip` (GTX 700 series, Tesla K40/K80)
 - &raquo; **Nvidia Maxwell** - `rhminer.version.operating-system.Maxwell.zip` (GTX 900 series, Quadro M series, GTX Titan X)
 - &raquo; **Nvidia Pascal** - `rhminer.version.operating-system.Pascal.zip` (GTX 1000 series, Titan Xp, Tesla P40, Tesla P4, GP100/Tesla P100 – DGX-1)
 - &raquo; **Nvidia Volta** - `rhminer.version.operating-system.Tesla.zip` (Tesla V100, Titan V, Quadro GV100)
	
	You can also download an example batch file to get started, [here](https://github.com/polyminer1/rhminer/blob/master/Release/solomining-mainnet.bat)

## Configure RHMiner

**For Windows:**

Either create a new file named `RHMiner.bat` file in the same folder as RHMiner.exe or get one example bat file from [here](https://github.com/polyminer1/rhminer/tree/master/Release). The file should contain one of the following lines:

For CPU and GPU:
`rhminer.exe -v 2 -r 20 -s http://127.0.0.1:4009 -cpu -cputhreads 1 -gpu 0 -gputhreads 100`

For CPU ONLY:
`rhminer.exe -v 2 -r 20 -s http://127.0.0.1:4009 -cpu -cputhreads 1`

For GPU ONLY:
`rhminer.exe -v 2 -r 20 -s http://127.0.0.1:4009 -gpu 0 -gputhreads 100`

Change the `-cputhreads` value to the number of threads your CPU can run. If you have a 4-core/8-thread CPU, start with 6.

Change the `-gputhreads` value to the result of this function: `GPU Memory (MB) * 0.75 / 8.8 ` 
		(e.g. For a GTX 1060 3GB that is 3000 * 0.75 / 8.8 = 255 threads).

After that, save and close the .bat file, this is the file you will run to start your miner.

**For Linux:**

Follow the steps above, but instead create a simple shell script or start the miner directly with the given arguments.

**Run the miner:**

Command Line Options for RHMiner can be seen with the `-h` argument:

```
General options:
  -list                 List all gpu in the system
  -diff                 Set local difficulyu. ex: -diff 0.832
  -logfilename          Set the name of the log's filename. Note: the log file will be overwritten every time you start rhminer
  -extrapayload         An extra payload to be added when submiting solution to local wallet.
  -displayspeedtimeout  Display mining speeds every x seconds. Default is 10
  -processpriority      Set miner's process priority. 0=Background Process, 1=Low Priority, 2=Normal Priority. Default is 2. WARNING: Changing this value will affect GPU mining.
  -v                    Log verbosity. From 0 to 3. 0 no log, 1 normal log, 2 include warnings. Default is 1
  -devfee               Set devfee raward percentage. To disable devfee, simply put 0 here. But, before disabling developer fees, consider that it takes time and energy to maintain, develop and optimize this software. Your help is very appreciated.
  -completelist         Exhaustive list of all devices in the system
  -processorsaffinity   Force miner to only run on selected logical core processors. ex: -processorsaffinity 0,3 will make the miner run only on logical core #0 and #3. WARNING: Changing this value will affect GPU mining.
  -maxsubmiterrors      Stop the miner when a number of consecutive submit errors occured. Default is 10 consecutive errors. This is usefull when mining into local wallet.

Gpu options:
  -cpu                  Enable the use of CPU to mine. ex '-cpu -cputhread 4' will enable mining on cpu while gpu mining.
  -cputhreads           Number of CPU miner threads when mining with CPU. ex: -cpu -cputhread 4
  -gputhreads           Cuda thread count. ex: -gputhreads  100 launche 100 threads on selected gpu
  -gpu                  Enable indiviaual GPU by their index. GPU not in the list will be disabled. ex: -gpu 0,3,4.
  -kernelactivewayting  Enable active wayting on kernel run. This will raise cpu usage but bring more stability, specially when mining on multiple gpu. WARNING: This affect cpu mining

Network options:
  -dar                  Disable auto-reconnect on connection lost. Note : The miner will exit uppon loosing connection.
  -s                    Stratum server or wallet address:port. NOTE: You can also use http://address.xyz to connect to local wallet.
  -su                   Stratum user
  -pw                   Stratum password
  -fo                   Failover address:port for stratum or local wallet
  -fou                  Failover user for stratum of a local wallet
  -fop                  Failover password for stratum or local wallet
  -r                    Retries connection count for stratum or local wallet
```
	
**Troubleshooting tips**

On Windows 7/8/10, if you get `missing OpenCL.dll` error, you need to download it into rhminer's folder (hint: You can safely get one with the Intel SDK on Intel's opencl website).

If RHMiner stops with the error: `Miner name is too long',  click the "Project" -> "Options" menu in the GUI wallet and change the first fields value to something shorter (max 26 characters). If you use the PascalCoin daemon, change the value of `RPC_SERVERMINER_NAME` in the pascalcoin_daemon.ini to something shorter than 27 characters.

**Developer fee information**

The default donation is 1%. This donation is hardcoded in the binaries downloadable on github. This is to help compensate for the time it took to R&D, develop, stabilize and optimize this miner and for the upcoming bug fixes and optimizations. To disable this donation, download and compile locally then use the `-devfee` option with chosen donation percentage. "0" will disable the donation.

**For direct donations:**

Pascal wallet - 529692-23

Bitcoin address - 19GfXGpRJfwcHPx2Nf8wHgMps8Eat1o4Jp
