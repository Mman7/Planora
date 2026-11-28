"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSettingsStore, AI_PROVIDERS } from "@/lib/settings";
import type { AIProviderType, SettingsSection } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function AIProviderSettingsSection({ registerRef }: SectionProps) {
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const connectProvider = useSettingsStore((s) => s.connectProvider);
  const disconnectProvider = useSettingsStore((s) => s.disconnectProvider);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType | null>(
    aiProvider?.provider ?? null,
  );
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const isConnected = aiProvider?.connectionStatus === "CONNECTED";
  const isChecking = aiProvider?.connectionStatus === "CHECKING";

  const handleConnect = async () => {
    if (!selectedProvider || !apiKey.trim()) return;
    await connectProvider(selectedProvider, apiKey);
    setApiKey("");
    setShowKey(false);
  };

  const handleDisconnect = async () => {
    await disconnectProvider();
    setApiKey("");
  };

  const statusBadge = () => {
    switch (aiProvider?.connectionStatus) {
      case "CONNECTED":
        return <Badge className="bg-[#e8f4ec] text-[#568568]">Connected</Badge>;
      case "CHECKING":
        return <Badge variant="secondary">Checking...</Badge>;
      case "INVALID":
        return <Badge className="bg-[#f9eaea] text-[#b96b72]">Invalid credentials</Badge>;
      case "FAILED":
        return <Badge className="bg-[#f9eaea] text-[#b96b72]">Connection failed</Badge>;
      default:
        return <Badge variant="secondary">Not configured</Badge>;
    }
  };

  const providerName =
    AI_PROVIDERS.find((p) => p.id === aiProvider?.provider)?.name ?? "None";

  return (
    <SettingsGroup id="ai-provider" title="AI provider" registerRef={registerRef}>
      <SettingRow label="Provider">
        {isConnected ? (
          <span className="text-xs text-[#77788a]">{providerName}</span>
        ) : (
          <Select
            value={selectedProvider ?? undefined}
            onValueChange={(val) => setSelectedProvider(val as AIProviderType)}
          >
            <SelectTrigger className="max-w-48" aria-label="AI provider">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={!p.available}>
                  {p.name}
                  {!p.available && " (Coming soon)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </SettingRow>
      <SettingRow label="API key">
        {isConnected ? (
          <div className="flex items-center gap-2">
            {statusBadge()}
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key"
                className="w-48 pr-8"
                autoComplete="off"
                aria-label="API key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-[#77788a] hover:text-[#25243a]"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={!selectedProvider || !apiKey.trim() || isChecking}
            >
              {isChecking && <Loader2 size={14} className="animate-spin" />}
              Connect
            </Button>
          </div>
        )}
      </SettingRow>
      {!isConnected && aiProvider?.connectionStatus !== "NOT_CONFIGURED" && (
        <div className="border-t border-[#e5e7ef] px-4 py-2">{statusBadge()}</div>
      )}
    </SettingsGroup>
  );
}
