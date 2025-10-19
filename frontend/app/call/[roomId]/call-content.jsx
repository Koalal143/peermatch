"use client"

import { useEffect, useRef } from "react"
import { useHMSActions, useHMSStore, useVideo, useAVToggle } from "@100mslive/react-sdk"
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CallContent() {
  const hmsActions = useHMSActions()
  const peers = useHMSStore((state) => state.peers)
  const localPeer = useHMSStore((state) => state.localPeer)
  const { videoRef, videoAttached } = useVideo({ peer: localPeer })
  const { isAudioOn, isVideoOn, toggleAudio, toggleVideo } = useAVToggle()
  const containerRef = useRef(null)

  useEffect(() => {
    // Инициализация комнаты
    const joinRoom = async () => {
      try {
        await hmsActions.join({
          userName: localPeer?.name || "User",
          authToken: "",
        })
      } catch (error) {
        console.error("Error joining room:", error)
      }
    }

    if (localPeer) {
      joinRoom()
    }
  }, [localPeer, hmsActions])

  const handleLeaveRoom = async () => {
    try {
      await hmsActions.leave()
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
      }}
    >
      {/* Video Grid */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "8px",
          padding: "8px",
          overflow: "auto",
        }}
      >
        {/* Local Video */}
        {videoAttached && videoRef && (
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                color: "#fff",
                fontSize: "12px",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              Вы
            </div>
          </div>
        )}

        {/* Remote Videos */}
        {peers &&
          peers.map((peer) => (
            <RemoteVideo key={peer.id} peer={peer} />
          ))}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          padding: "16px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Button
          onClick={toggleAudio}
          variant={isAudioOn ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          {isAudioOn ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={toggleVideo}
          variant={isVideoOn ? "default" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          {isVideoOn ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <Button
          onClick={handleLeaveRoom}
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          <Phone className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

function RemoteVideo({ peer }) {
  const { videoRef, videoAttached } = useVideo({ peer })

  if (!videoAttached) {
    return (
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "8px",
            color: "#fff",
            fontSize: "12px",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          {peer.name}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          color: "#fff",
          fontSize: "12px",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        {peer.name}
      </div>
    </div>
  )
}

