"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";

export default function GameBoard() {
  const { address, isConnected, connectWallet } = useWallet();
  const [gameId, setGameId] = useState<number | null>(null);
  const [result, setResult] = useState<{won: boolean, choice: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Check service status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkServices();
        setServiceStatus(status);
        setDemoMode(status.demoMode);
      } catch (error) {
        console.log("Service check failed:", error);
        setDemoMode(true);
      }
    };

    checkStatus();
  }, []);

  const handleStartGame = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setLoading(true);
    try {
      // Create a dummy signer for now - in real app you'd get this from wagmi
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await startNewGame(signer);
      // Game ID'yi transaction'dan al - simplified for demo
      setGameId(1);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeGuess = async (choice: number) => {
    if (!gameId) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      await makeGuess(signer, gameId, choice);

      // Sonucu al
      const gameResult = await getGameResult(signer, gameId);
      setResult(gameResult);
    } catch (error) {
      console.error("Error making guess:", error);
      alert("Error making guess. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getChoiceName = (choice: number) => {
    switch (choice) {
      case 0: return "Rock";
      case 1: return "Paper";
      case 2: return "Scissors";
      default: return "Unknown";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        FHE Guessing Game
      </h1>

      {/* Service Status Banner */}
      {serviceStatus && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          demoMode
            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            : 'bg-green-100 text-green-800 border border-green-300'
        }`}>
          {demoMode ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">⚠️</span>
              <span>
                Demo Mode: FHEVM service temporarily unavailable.
                Game will work with mock data.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">✅</span>
              <span>All services operational</span>
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Connect your wallet to play</p>
          <button
            onClick={connectWallet}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <p className="text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>

          {!gameId ? (
            <div className="text-center">
              <button
                onClick={handleStartGame}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                {loading ? "Starting Game..." : "Start New Game"}
              </button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-4">Make Your Choice</h2>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => handleMakeGuess(0)}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                  >
                    Rock
                  </button>
                  <button
                    onClick={() => handleMakeGuess(1)}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                  >
                    Paper
                  </button>
                  <button
                    onClick={() => handleMakeGuess(2)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                  >
                    Scissors
                  </button>
                </div>
              </div>

              {result && (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Result</h3>
                  <p className={`text-xl font-bold ${result.won ? 'text-green-600' : 'text-red-600'}`}>
                    {result.won ? "You Won! 🎉" : "You Lost 😔"}
                  </p>
                  <p className="text-gray-600">
                    Computer chose: {getChoiceName(result.choice)}
                  </p>
                  <button
                    onClick={() => {
                      setGameId(null);
                      setResult(null);
                    }}
                    className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        {demoMode ? (
          <>
            <p>🔄 Demo Mode Active</p>
            <p>FHEVM service temporarily unavailable</p>
            <p className="text-xs mt-1">Using mock encryption for demonstration</p>
          </>
        ) : (
          <>
            <p>🔒 Powered by Fully Homomorphic Encryption</p>
            <p>Your choices are encrypted and secure</p>
          </>
        )}
      </div>
    </div>
  );
}
