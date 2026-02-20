"use client";

import React, { useEffect, useState } from "react";
import { Icons, iconVariants } from "~/components/ui/icons";

type LinkFlowVisualizerProps = {
  originalUrl?: string;
  shortUrl?: string;
  isLoading?: boolean;
};

export const LinkFlowVisualizer = ({
  originalUrl,
  shortUrl,
  isLoading = false,
}: LinkFlowVisualizerProps) => {
  const [showLines, setShowLines] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (originalUrl && !isLoading) {
      setShowLines(true);
      const timer = setTimeout(() => setShowOutput(true), 800);
      return () => clearTimeout(timer);
    }
  }, [originalUrl, isLoading]);

  useEffect(() => {
    if (!originalUrl || isLoading) {
      setShowLines(false);
      setShowOutput(false);
    }
  }, [isLoading, originalUrl]);

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      {originalUrl && (
        <div className="space-y-8">
          {/* Input URL Box */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-full px-4 py-3 rounded-lg bg-card border border-border flex items-center gap-2 group transition-all duration-300 ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <Icons.Lock className={iconVariants({ size: "sm" })} />
              <span className="text-sm font-mono text-foreground truncate flex-1">
                {originalUrl}
              </span>
            </div>

            {/* Decorative Dots */}
            <div className="flex gap-2 animate-float">
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
            </div>

            {/* Flow Animation SVG */}
            {showLines && (
              <svg
                width="100%"
                height="120"
                viewBox="0 0 400 120"
                preserveAspectRatio="none"
                className="w-full"
              >
                {/* Left path - Green */}
                <defs>
                  <style>
                    {`
                      .flow-line {
                        stroke-width: 2.5;
                        fill: none;
                        stroke-dasharray: 1000;
                      }
                      .flow-line-left {
                        stroke: rgb(74, 222, 128);
                        animation: flowDown 1.5s ease-in forwards;
                      }
                      .flow-line-right {
                        stroke: rgb(147, 112, 219);
                        animation: flowDown 1.5s ease-in 0.3s forwards;
                      }
                      .flow-dot {
                        animation: pulse-flow 1.5s ease-in-out infinite;
                      }
                    `}
                  </style>
                </defs>

                {/* Left flowing path */}
                <path
                  d="M 50 10 Q 50 60 10 120"
                  className="flow-line flow-line-left"
                  strokeLinecap="round"
                />

                {/* Right flowing path */}
                <path
                  d="M 350 10 Q 350 60 390 120"
                  className="flow-line flow-line-right"
                  strokeLinecap="round"
                />

                {/* Center flowing path */}
                <path
                  d="M 200 10 L 200 120"
                  className="flow-line"
                  stroke="rgb(59, 191, 255)"
                  style={{
                    animation: "flowDown 1.5s ease-in 0.15s forwards",
                  }}
                  strokeLinecap="round"
                />

                {/* Flowing dots */}
                {[0, 0.3, 0.6].map((delay, i) => (
                  <circle
                    key={i}
                    cx={100 - 50 * (i % 2)}
                    cy={20 + 50 * (i % 2)}
                    r="0"
                    fill="rgb(74, 222, 128)"
                    className="flow-dot"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </svg>
            )}

            {/* Output URLs */}
            {showOutput && (
              <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-in">
                {/* Short Link Left */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-green-400/10 to-green-500/10 border border-green-400/30 hover:border-green-400/60 transition-colors">
                  <div className="flex items-center gap-1">
                    <Icons.Link
                      className={`${iconVariants({
                        size: "sm",
                      })} text-green-400`}
                    />
                    <span className="text-xs font-semibold text-green-400">
                      Short
                    </span>
                  </div>
                  {shortUrl ? (
                    <span className="text-xs font-mono text-green-400 font-bold truncate w-full text-center">
                      {shortUrl.replace(/^https?:\/\//, "")}
                    </span>
                  ) : (
                    <div className="h-4 w-20 bg-green-400/20 rounded animate-pulse" />
                  )}
                </div>

                {/* Branded Link Center */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-purple-400/10 to-purple-500/10 border border-purple-400/30 hover:border-purple-400/60 transition-colors">
                  <div className="flex items-center gap-1">
                    <Icons.Link
                      className={`${iconVariants({
                        size: "sm",
                      })} text-purple-400`}
                    />
                    <span className="text-xs font-semibold text-purple-400">
                      Brand
                    </span>
                  </div>
                  <span className="text-xs text-purple-400/60">
                    Customize link
                  </span>
                </div>

                {/* Newsletter/BIO Right */}
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gradient-to-br from-blue-400/10 to-cyan-500/10 border border-cyan-400/30 hover:border-cyan-400/60 transition-colors">
                  <div className="flex items-center gap-1">
                    <Icons.Share2
                      className={`${iconVariants({
                        size: "sm",
                      })} text-cyan-400`}
                    />
                    <span className="text-xs font-semibold text-cyan-400">
                      Share
                    </span>
                  </div>
                  <span className="text-xs text-cyan-400/60">Bios link</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="w-full flex justify-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
