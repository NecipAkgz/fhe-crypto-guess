import GameBoard from "@/components/GameBoard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            FHE Guessing Game
          </h1>
          <p className="text-gray-600 text-lg">
            Play Rock-Paper-Scissors with Fully Homomorphic Encryption
          </p>
        </div>

        <GameBoard />

        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              How It Works
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                <p>Connect your wallet to start playing</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                <p>Click start new game to Start</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                <p>Choose Rock, Paper, or Scissors</p>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                <p>See the encrypted result and play again!</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🔒 Privacy Guaranteed</h3>
              <p className="text-green-700 text-sm">
                Your choices are encrypted using Fully Homomorphic Encryption.
                The smart contract computes results without ever seeing your actual choices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
