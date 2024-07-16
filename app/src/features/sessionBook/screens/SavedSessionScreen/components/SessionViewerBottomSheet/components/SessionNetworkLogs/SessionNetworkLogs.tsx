import { NetworkEventData, RQSessionEventType } from "@requestly/web-sdk";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingAttributes, getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { NetworkLog } from "features/sessionBook/types";
import { convertSessionRecordingNetworkLogsToRQNetworkLogs } from "views/features/sessions/SessionViewer/NetworkLogs/helpers";
import NetworkLogsPanel from "views/features/sessions/SessionViewer/NetworkLogs/NetworkLogsPanel";
import "./sessionNetworkLogs.scss";

interface SessionNetworkLogsProps {
  playerTimeOffset: number;
}

const SessionNetworkLogs: React.FC<SessionNetworkLogsProps> = ({ playerTimeOffset }) => {
  const events = useSelector(getSessionRecordingEvents);
  const attributes = useSelector(getSessionRecordingAttributes);

  const networkLogs = useMemo<NetworkLog[]>(() => {
    const networkEvents = events?.[RQSessionEventType.NETWORK] || [];
    return networkEvents.map((networkEvent: NetworkEventData) => ({
      ...networkEvent,
      timeOffset: Math.floor((networkEvent.timestamp - attributes?.startTime) / 1000),
    }));
  }, [events, attributes?.startTime]);

  const rqNetworkLogs = useMemo(() => convertSessionRecordingNetworkLogsToRQNetworkLogs(networkLogs), [networkLogs]);

  if (rqNetworkLogs) {
    return (
      <div className="session-network-logs-container">
        <NetworkLogsPanel
          startTime={attributes?.startTime}
          networkLogs={rqNetworkLogs}
          playerTimeOffset={playerTimeOffset}
        />
      </div>
    );
  } else {
    return <>No Logs</>;
  }
};

export default React.memo(SessionNetworkLogs);