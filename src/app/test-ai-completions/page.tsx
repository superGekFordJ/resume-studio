"use client"

import * as React from "react"
import { AICompletionsTextarea } from "@/components/ai/completions/AICompletionsTextarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function TestAICompletionsPage() {
  const [value1, setValue1] = React.useState("")
  const [value2, setValue2] = React.useState("")
  const [value3, setValue3] = React.useState("")
  const [logs, setLogs] = React.useState<string[]>([])

  const addLog = React.useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Mock suggestion function - simple text completion
  const getMockSuggestion = React.useCallback(async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    
    const suggestions: Record<string, string> = {
      "hello": " world! How are you today?",
      "react": " is a powerful library for building user interfaces",
      "slate": ".js is a rich text editor framework for React",
      "ai": " completions make writing more efficient and productive",
      "test": "ing is essential for maintaining code quality",
      "javascript": " is the language of the web",
      "typescript": " adds static type checking to javascript",
    }

    const lowerText = text.toLowerCase().trimStart()
    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (key.startsWith(lowerText) && lowerText.length > 1) {
        return suggestion
      }
    }
    
    // Fallback: add some generic completion
    if (text.length > 3) {
      return ` ${text} - this is a mock completion for testing purposes`
    }
    
    return ""
  }, [])

  // Mock context-aware suggestion function
  const getMockContextSuggestion = React.useCallback(async ({ 
    text, 
    cursorContext 
  }: { 
    text: string; 
    cursorContext: { before: string; after: string } 
  }): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { before, after } = cursorContext
    
    // Context-aware suggestions based on what comes before/after
    if (before.includes("My name is")) {
      return " John Doe and I work as a software developer"
    }
    
    if (before.includes("I love")) {
      return " programming and building amazing user experiences"
    }
    
    if (before.includes("The weather")) {
      return " is beautiful today, perfect for coding outdoors"
    }
    
    if (text.length > 2) {
      return ` ${text} (context: before="${before.slice(-10)}", after="${after.slice(0, 20)}")`
    }
    
    return ""
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Completions Textarea Test</h1>
        <p className="text-muted-foreground">
          Test the new inline ghost text functionality with different scenarios
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Suggestions</CardTitle>
            <CardDescription>
              Type: "hello", "react", "slate", "ai", "test", "javascript", or "typescript"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AICompletionsTextarea
              value={value1}
              onValueChange={setValue1}
              getSuggestion={getMockSuggestion}
              debounceTime={1000}
              placeholder="Start typing to see suggestions..."
              rows={3}
              onSuggestionFetch={() => addLog("Fetching suggestion...")}
              onSuggestionReceived={(suggestion) => addLog(`Received: "${suggestion.slice(0, 50)}${suggestion.length > 50 ? '...' : ''}"`)}
              onSuggestionError={(error) => addLog(`Error: ${error}`)}
            />
            <div className="text-sm text-muted-foreground">
              <p><kbd>Tab</kbd> or <kbd>→</kbd> to accept • <kbd>Esc</kbd> to reject</p>
            </div>
          </CardContent>
        </Card>

        {/* Context-Aware Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Context-Aware Suggestions</CardTitle>
            <CardDescription>
              Try: "My name is", "I love", "The weather"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AICompletionsTextarea
              value={value2}
              onValueChange={setValue2}
              getSuggestionWithContext={getMockContextSuggestion}
              placeholder="Type something to see context-aware suggestions..."
              rows={4}
              debounceTime={1000}
              onSuggestionFetch={() => addLog("Context fetch started...")}
              onSuggestionReceived={(suggestion) => addLog(`Context suggestion: "${suggestion.slice(0, 40)}..."`)}
              onSuggestionError={(error) => addLog(`Context error: ${error}`)}
            />
          </CardContent>
        </Card>

        {/* Single Line Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Single Line Mode</CardTitle>
            <CardDescription>
              Test single-line behavior (Enter won't create new lines)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AICompletionsTextarea
              value={value3}
              onValueChange={setValue3}
              getSuggestion={getMockSuggestion}
              placeholder="Single line input..."
              rows={1}
              maxLength={100}
              resize="none"
              onSuggestionFetch={() => addLog("Single-line suggestion fetch")}
              onSuggestionReceived={(suggestion) => addLog(`Single-line: "${suggestion.slice(0, 30)}..."`)}
            />
            <div className="text-xs text-muted-foreground">
              Max length: 100 characters • No newlines allowed
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => {
                  setValue1("hello")
                  setValue2("My name is")
                  setValue3("test")
                }}
              >
                Fill Test Values
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setValue1("")
                  setValue2("")
                  setValue3("")
                }}
              >
                Clear All
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLogs([])}
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Activity Logs 
              <Badge variant="secondary">{logs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity yet...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono bg-muted/50 p-2 rounded">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> Accept suggestion</li>
                  <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">→</kbd> Accept suggestion</li>
                  <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> Reject suggestion</li>
                  <li><kbd className="px-1 py-0.5 bg-muted rounded text-xs">Any key</kbd> Reject & continue typing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Visual Cues</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <span className="italic opacity-50">Ghost text</span> appears inline</li>
                  <li>• Spinner shows when fetching</li>
                  <li>• Text updates in real-time</li>
                  <li>• Logs show activity timeline</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 