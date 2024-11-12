import React, { useState, useEffect } from "react";
import { useTrackTranscription, useLocalParticipant } from "@livekit/components-react";

function DownloadTranscriptionLog({ agentAudioTrack, accentColor }) {
  const localParticipant = useLocalParticipant();
  const localMessages = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: "Microphone",
    participant: localParticipant,
  });

  const agentMessages = useTrackTranscription(agentAudioTrack);
  const [messages, setMessages] = useState([]);
  const [processedSegmentIds, setProcessedSegmentIds] = useState(new Set()); // Store processed IDs

  useEffect(() => {
    function updateMessages(localMessages, agentMessages) {
      setMessages([]);
      const local = localMessages.map(segment => {
        processedSegmentIds.add(segment.sid);
        return {
          text: segment.text,
          timestamp: segment.lastReceivedTime, 
          isAgent: false,
        };
      });
      const agent = agentMessages.map(segment => {
        processedSegmentIds.add(segment.sid);
        return {
          text: segment.text,
          timestamp: segment.firstReceivedTime,
          isAgent: true,
        };
      });
    // console.log(localMessages)

    // console.log(agentMessages)
      const combinedMessages = [...local, ...agent].sort((a, b) => a.timestamp - b.timestamp);
  
      setMessages(prev => [...prev, ...combinedMessages].sort((a, b) => a.timestamp - b.timestamp));
      // console.log(messages)
    }

    updateMessages(localMessages.segments,agentMessages.segments);
    // updateMessages(, true);
    // Update the processed segments state without causing re-render
    setProcessedSegmentIds(new Set(processedSegmentIds));
  }, [localMessages, agentMessages, processedSegmentIds]);

  function downloadLogs() {
    const logContent = messages
      .map(msg => `${new Date(msg.timestamp).toLocaleTimeString()} - ${msg.isAgent ? "Agent" : "You"}: ${msg.text}`)
      .join("\n");

    const element = document.createElement("a");
    const file = new Blob([logContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "chat_log.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  return (
    <div>
      <button onClick={downloadLogs} style={{ marginBottom: "10px", cursor: "pointer" }}>
        Download Chat Log
      </button>
    </div>
  );
}

export default DownloadTranscriptionLog;