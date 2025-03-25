"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Container, Title, Text, Button, Group, Box, Stack, CopyButton, Textarea } from "@mantine/core"
import Link from "next/link"

export default function DiscordTextGenerator() {
  const [text, setText] = useState<string>('Welcome to <span class="ansi-33">Rebane</span>\'s <span class="ansi-45"><span class="ansi-37">Discord</span></span> <span class="ansi-31">C</span><span class="ansi-32">o</span><span class="ansi-33">l</span><span class="ansi-34">o</span><span class="ansi-35">r</span><span class="ansi-36">e</span><span class="ansi-37">d</span> Text Generator!')
  const [selectedText, setSelectedText] = useState<string>("")
  const [selectionStart, setSelectionStart] = useState<number>(0)
  const [selectionEnd, setSelectionEnd] = useState<number>(0)


  const textareaRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false);

  const [tooltipOpened, setTooltipOpened] = useState(false)
  const [tooltipText, setTooltipText] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  // ANSI color codes
  const fgColors = [
    { code: "30", color: "#4f545c", tooltip: "Dark Gray (33%)" },
    { code: "31", color: "#dc322f", tooltip: "Red" },
    { code: "32", color: "#859900", tooltip: "Yellowish Green" },
    { code: "33", color: "#b58900", tooltip: "Gold" },
    { code: "34", color: "#268bd2", tooltip: "Light Blue" },
    { code: "35", color: "#d33682", tooltip: "Pink" },
    { code: "36", color: "#2aa198", tooltip: "Teal" },
    { code: "37", color: "#ffffff", tooltip: "White" },
  ]

  const bgColors = [
    { code: "40", color: "#002b36", tooltip: "Blueish Black" },
    { code: "41", color: "#cb4b16", tooltip: "Rust Brown" },
    { code: "42", color: "#586e75", tooltip: "Gray (40%)" },
    { code: "43", color: "#657b83", tooltip: "Gray (45%)" },
    { code: "44", color: "#839496", tooltip: "Light Gray (55%)" },
    { code: "45", color: "#6c71c4", tooltip: "Blurple" },
    { code: "46", color: "#93a1a1", tooltip: "Light Gray (60%)" },
    { code: "47", color: "#fdf6e3", tooltip: "Cream White" },
  ]

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const selection = window.getSelection()
      if (selection && selection.toString()) {
        setSelectedText(selection.toString())

        // Get the range information
        const range = selection.getRangeAt(0)
        setSelectionStart(range.startOffset)
        setSelectionEnd(range.endOffset)
        // console.log(range)
      }
      console.log(selection?.toString())
    }
  }
  
  const applyStyle = (styleCode: string) => {
    // if (!textareaRef.current || !selectedText) return
    // const selection = window.getSelection()
    // if (!selection || selection.rangeCount === 0) return

    // const range = selection.getRangeAt(0)

    // if (styleCode === "0") {
    //   // Reset all formatting
    //   textareaRef.current.innerHTML = 'Welcome to <span class="ansi-33">Rebane</span>\'s <span class="ansi-45"><span class="ansi-37">Discord</span></span> <span class="ansi-31">C</span><span class="ansi-32">o</span><span class="ansi-33">l</span><span class="ansi-34">o</span><span class="ansi-35">r</span><span class="ansi-36">e</span><span class="ansi-37">d</span> Text Generator!'
    //   return
    // }

    // // Create a span with the appropriate class
    // const span = document.createElement("span")
    // span.className = `ansi-${styleCode}`
    // span.textContent = selectedText

    // // Replace the selected text with the styled span
    // range.deleteContents()
    // range.insertNode(span)

    // // Keep the selection on the newly created span
    // range.selectNodeContents(span)
    // selection.removeAllRanges()
    // selection.addRange(range)
  }

  // Copy related
  const handleCopy = () => {
    const text = copyFormattedText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2s
      })
      .catch(err => console.error("Clipboard copy failed:", err));
  };
  const copyFormattedText = () => {
    if (!textareaRef.current) return ""
    // Convert the HTML with spans to ANSI escape codes
    const nodes = textareaRef.current.childNodes
    const ansiText = nodesToANSI(nodes, [{ fg: "0", bg: "0", st: "0" }])
    // Format for Discord
    const discordText = "```ansi\n" + ansiText + "\n```"
    console.log(ansiText)
    return discordText
  }
  // Function to convert DOM nodes to ANSI escape sequences
  const nodesToANSI = (
    nodes: NodeListOf<ChildNode> | Array<ChildNode>,
    states: Array<{ fg: string; bg: string; st: string }>,
  ) => {
    let result = ""

    for (const node of Array.from(nodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        // Plain text node
        result += node.textContent
      } else if (node.nodeName === "BR") {
        // Line break
        result += "\n"
      } else if (node.nodeName === "SPAN") {
        const span = node as HTMLSpanElement
        const classes = span.className.split(" ")

        for (const cls of classes) {
          if (cls.startsWith("ansi-")) {
            const ansiCode = cls.split("-")[1]
            const newState = { ...states[states.length - 1] }

            // Update state based on ANSI code
            if (Number.parseInt(ansiCode) < 30) newState.st = ansiCode
            else if (Number.parseInt(ansiCode) >= 30 && Number.parseInt(ansiCode) < 40) newState.fg = ansiCode
            else if (Number.parseInt(ansiCode) >= 40) newState.bg = ansiCode

            states.push(newState)

            // Add ANSI escape sequence
            if (Number.parseInt(ansiCode) >= 40) {
              result += `\x1b[${newState.st};${newState.bg}m`
            } else {
              result += `\x1b[${newState.st};${newState.fg}m`
            }

            // Process child nodes
            if (span.childNodes.length > 0) {
              result += nodesToANSI(span.childNodes, states)
            } else {
              result += span.textContent
            }

            // Reset and restore previous state
            result += `\x1b[0m`
            states.pop()

            // Restore previous state if needed
            const prevState = states[states.length - 1]
            if (prevState.fg !== "0") result += `\x1b[${prevState.st};${prevState.fg}m`
            if (prevState.bg !== "0") result += `\x1b[${prevState.bg}m`
          }
        }
      } else if (node.childNodes.length > 0) {
        // Process other element nodes with children
        result += nodesToANSI(node.childNodes, states)
      }
    }

    return result
  }

  // To set tooltip
  const showTooltip = (text: string, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltipText(text)
    setTooltipPosition({
      top: rect.top - 40,
      left: rect.left + rect.width / 2,
    })
    setTooltipOpened(true)
  }

  const hideTooltip = () => {
    setTooltipOpened(false)
  }

  return (
    <Container size="" py="xl" style={{ backgroundColor: "#36393F", minHeight: "100vh", color: "white" }}>
      <Stack style={{ gap: "16px" }} align="center">
        <Title order={1} style={{ textAlign: "center" }} mb="md">
          Rebane&apos;s Discord{" "}
          <Text component="span" color="#5865F2" inherit>
            Colored
          </Text>{" "}
          Text Generator
        </Title>

        <Stack style={{ gap: "16px", maxWidth: 600 }} align="center">
          <Title order={2} size="h3" style={{ textAlign: "center" }}>
            About
          </Title>
          <Text style={{ textAlign: "center" }}>
            This is a simple app that creates colored Discord messages using the ANSI color codes available on the
            latest Discord desktop versions.
          </Text>
          <Text style={{ textAlign: "center" }}>
            To use this, write your text, select parts of it and assign colors to them, then copy it using the button
            below, and send in a Discord message.
          </Text>

          <Title order={2} size="h3" style={{ textAlign: "center" }} mt="md">
            Source Code
          </Title>
          <Text style={{ textAlign: "center" }}>
            This app runs entirely in your browser and the source code is freely available on{" "}
            <Link href="https://github.com" style={{ color: "#00AFF4" }}>
              GitHub
            </Link>
            . Shout out to kkrypt0nn for{" "}
            <Link href="#" style={{ color: "#00AFF4" }}>
              this guide
            </Link>
            .
          </Text>

          <Title order={2} size="h3" style={{ textAlign: "center" }} mt="md">
            Create your text
          </Title>

          <Group style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Button
              variant="default"
              onClick={() => applyStyle("0")}
              style={{ backgroundColor: "#4f545c", color: "white", "&:hover": { backgroundColor: "#5d6269" } }}
            >
              Reset All
            </Button>
            <Button
              variant="default"
              onClick={() => applyStyle("1")}
              style={{
                backgroundColor: "#4f545c",
                color: "white",
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#5d6269" },
              }}
            >
              Bold
            </Button>
            <Button
              variant="default"
              onClick={() => applyStyle("4")}
              style={{
                backgroundColor: "#4f545c",
                color: "white",
                textDecoration: "underline",
                "&:hover": { backgroundColor: "#5d6269" },
              }}
            >
              Line
            </Button>
          </Group>

          <Group style={{ display: "flex", justifyContent: "center", gap: "16px" }} align="center">
            <Text fw={700} size="sm" style={{ width: 30 }}>
              FG
            </Text>
            {fgColors.map((color) => (
              <Button
                key={color.code}
                variant="default"
                style={{
                  backgroundColor: color.color,
                  width: 30,
                  height: 30,
                  padding: 0,
                  minWidth: 30,
                  "&:hover": { backgroundColor: color.color, opacity: 0.8 },
                }}
                onClick={() => applyStyle(color.code)}
                onMouseEnter={(e) => showTooltip(color.tooltip, e)}
                onMouseLeave={hideTooltip}
              />
            ))}
          </Group>

          <Group style={{ display: "flex", justifyContent: "center", gap: "16px" }} align="center">
            <Text fw={700} size="sm" style={{ width: 30 }}>
              BG
            </Text>
            {bgColors.map((color) => (
              <Button
                key={color.code}
                variant="default"
                style={{
                  backgroundColor: color.color,
                  width: 30,
                  height: 30,
                  padding: 0,
                  minWidth: 30,
                  "&:hover": { backgroundColor: color.color, opacity: 0.8 },
                }}
                onClick={() => applyStyle(color.code)}
                onMouseEnter={(e) => showTooltip(color.tooltip, e)}
                onMouseLeave={hideTooltip}
              />
            ))}
          </Group>

          <Box
            ref={textareaRef}
            contentEditable
            onMouseUp={handleTextSelection}
            content="djn"
            style={{
              width: "100%",
              height: 200,
              backgroundColor: "#2F3136",
              color: "#B9BBBE",
              border: "1px solid #202225",
              borderRadius: 5,
              padding: 10,
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              fontSize: "0.875rem",
              lineHeight: "1.125rem",
              textAlign: "left",
              overflow: "auto",
              resize: "both",
            }}
            dangerouslySetInnerHTML={{
              __html:text,
            }}
          />
          <Button
            color={copied ? "teal" : "gray"}
            onClick={handleCopy}
            style={{
              backgroundColor: copied ? "#3BA55D" : "#4f545c",
              "&:hover": { backgroundColor: copied ? "#3BA55D" : "#5d6269" },
            }}
          >
            {copied ? "Copied!" : "Copy text as Discord formatted"}
          </Button>

          <Text size="xs" color="dimmed" mt="md">
            This is an unofficial tool, it is not made or endorsed by Discord.
          </Text>
        </Stack>
      </Stack>

      {tooltipOpened && (
        <Box
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: "translateX(-50%)",
            backgroundColor: "#3BA55D",
            color: "white",
            padding: "8px 16px",
            borderRadius: 3,
            zIndex: 1000,
            fontSize: 14,
          }}
        >
          {tooltipText}
        </Box>
      )}
    </Container>
  )
}

