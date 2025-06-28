"use client"

import * as React from "react"
import { InclusiveGhostTextbox } from "@/components/ui/InclusiveGhostTextbox"
import { Combobox } from "@/components/ui/combobox"

const sampleOptions = [
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "elasticsearch", label: "Elasticsearch" },
  { value: "sqlite", label: "SQLite" },
  { value: "cassandra", label: "Apache Cassandra" },
  { value: "dynamodb", label: "Amazon DynamoDB" },
]

const programmingLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "golang", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
]

// Custom Tab indicator component
const TabIndicator = () => (
  <div className="flex items-center gap-2 text-xs">
    <span className="p-[1.5px] rounded-md bg-gradient-to-r from-fuchsia-500 to-cyan-500">
      <span className="block px-1.5 py-0.5 bg-background rounded-[4px]">
        <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-500">
          Tab
        </span>
      </span>
    </span>
    <span className="text-muted-foreground font-medium">to accept</span>
  </div>
)

// Alternative arrow indicator
const ArrowIndicator = () => (
  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-md text-xs font-medium border border-white/20 shadow-lg">
    <span>→</span>
    <span className="text-white/80">accept</span>
  </div>
)

export default function TestGhostTextPage() {
  const [textValue, setTextValue] = React.useState("")
  const [comboValue, setComboValue] = React.useState("")
  const [textareaValue, setTextareaValue] = React.useState("")
  const [langValue, setLangValue] = React.useState("")

  // Mock AI suggestion function
  const getAISuggestion = React.useCallback(async (text: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simple mock suggestions based on input
    const suggestions: Record<string, string> = {
      "hello": "hello world",
      "react": "react component",
      "type": "typescript",
      "java": "javascript",
      "py": "python",
      "sql": "mysql",
      "data": "database",
      "api": "api endpoint",
      "test": "testing framework",
      "ui": "user interface",
    }
    
    const lowerText = text.toLowerCase()
    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (key.startsWith(lowerText) || suggestion.toLowerCase().includes(lowerText)) {
        return suggestion
      }
    }
    
    return ""
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Ghost Text Components Test</h1>
      
      <div className="space-y-8">
        {/* Basic InclusiveGhostTextbox */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Ghost Text Input</h2>
          <p className="text-muted-foreground">
            Try typing: "hello", "react", "type", "java", "py", "sql", "data", "api", "test", "ui"
          </p>
          <InclusiveGhostTextbox
            value={textValue}
            onValueChange={setTextValue}
            getSuggestion={getAISuggestion}
            placeholder="Type something..."
            className="max-w-md"
            debounceTime={300}
            acceptSuggestionOnEnter={false}
            resize="vertical"
            ghostIndicator={<TabIndicator />}
            onSuggestionAccepted={(value) => {
              console.log("Suggestion accepted:", value)
            }}
          />
          <p className="text-sm text-muted-foreground">
            Current value: "{textValue}"
          </p>
        </div>

        {/* Combobox with Ghost Text */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Database Combobox with Ghost Text</h2>
          <p className="text-muted-foreground">
            Try typing: "sql", "mongo", "post", "my" to see inclusive matching
          </p>
          <Combobox
            options={sampleOptions}
            value={comboValue}
            onValueChange={setComboValue}
            placeholder="Select a database..."
            className="max-w-md"
            enableGhostText={true}
          />
          <p className="text-sm text-muted-foreground">
            Selected: "{comboValue}"
          </p>
        </div>

        {/* Programming Languages Combobox */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Programming Languages Combobox</h2>
          <p className="text-muted-foreground">
            Try typing: "script", "type", "java", "py", "go" to see inclusive matching
          </p>
          <Combobox
            options={programmingLanguages}
            value={langValue}
            onValueChange={setLangValue}
            placeholder="Select a programming language..."
            className="max-w-md"
            enableGhostText={true}
          />
          <p className="text-sm text-muted-foreground">
            Selected: "{langValue}"
          </p>
        </div>

        {/* Textarea-style Ghost Text */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Textarea with Ghost Text</h2>
          <p className="text-muted-foreground">
            Multi-line text area with AI suggestions (Arrow indicator)
          </p>
          <InclusiveGhostTextbox
            value={textareaValue}
            onValueChange={setTextareaValue}
            getSuggestion={getAISuggestion}
            placeholder="Write a longer text..."
            rows={4}
            resize="vertical"
            className="max-w-lg"
            ghostIndicator={<ArrowIndicator />}
          />
          <p className="text-sm text-muted-foreground">
            Content: "{textareaValue}"
          </p>
        </div>

        {/* Ghost Indicator Tests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ghost Indicator Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simple text indicator */}
            <div className="space-y-2">
              <h3 className="font-medium">Simple Text Indicator</h3>
              <InclusiveGhostTextbox
                value=""
                onValueChange={() => {}}
                getSuggestion={getAISuggestion}
                placeholder="Type 'hello'..."
                ghostIndicator={
                  <span className="text-xs bg-black/80 text-white px-2 py-1 rounded">
                    Press Tab
                  </span>
                }
              />
            </div>

            {/* Function-based indicator */}
            <div className="space-y-2">
              <h3 className="font-medium">Dynamic Indicator</h3>
              <InclusiveGhostTextbox
                value=""
                onValueChange={() => {}}
                getSuggestion={getAISuggestion}
                placeholder="Type 'react'..."
                ghostIndicator={() => (
                  <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold border-2 border-orange-300">
                    <span className="animate-bounce">⚡</span>
                    <span>Tab</span>
                  </div>
                )}
              />
            </div>

            {/* Multiple key options */}
            <div className="space-y-2">
              <h3 className="font-medium">Multiple Key Options</h3>
              <InclusiveGhostTextbox
                value=""
                onValueChange={() => {}}
                getSuggestion={getAISuggestion}
                placeholder="Type 'type'..."
                ghostIndicator={
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      <kbd className="bg-white/20 px-1 rounded">Tab</kbd>
                      <span>or</span>
                      <kbd className="bg-white/20 px-1 rounded">→</kbd>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Combobox with indicator */}
            <div className="space-y-2">
              <h3 className="font-medium">Combobox with Indicator</h3>
              <Combobox
                options={programmingLanguages}
                value=""
                onValueChange={() => {}}
                placeholder="Type 'java'..."
                enableGhostText={true}
                // Note: Combobox doesn't support ghostIndicator yet, but we can show the concept
              />
              <p className="text-xs text-muted-foreground">
                (Combobox indicator would need separate implementation)
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold">How to Use</h2>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Tab</strong>, <strong>→</strong>, or <strong>Enter</strong> - Accept ghost text suggestion</li>
            <li>• <strong>Escape</strong> - Reject/dismiss ghost text suggestion</li>
            <li>• <strong>Inclusive matching</strong> - Suggestions can complete text before your cursor</li>
            <li>• <strong>Debounced</strong> - Suggestions are fetched after you stop typing for 300ms</li>
            <li>• <strong>Loading indicator</strong> - Shows when fetching suggestions</li>
            <li>• <strong>Ghost indicators</strong> - Visual cues appear when suggestions are available</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 