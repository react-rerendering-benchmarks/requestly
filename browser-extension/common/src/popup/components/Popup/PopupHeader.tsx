import React, { useCallback } from "react";
import { Button, Col, Row, Switch, Typography, Tooltip } from "antd";
import config from "../../../config";
import { EVENT, sendEvent } from "../../events";

interface PopupHeaderProps {
  isExtensionEnabled: boolean;
  handleToggleExtensionStatus: () => void;
}

const PopupHeader: React.FC<PopupHeaderProps> = ({ isExtensionEnabled, handleToggleExtensionStatus }) => {
  const onOpenAppButtonClick = useCallback(() => {
    window.open(`${config.WEB_URL}?source=popup`, "_blank");
    sendEvent(EVENT.OPEN_APP_CLICKED);
  }, []);

  return (
    <div className="popup-header">
      <div className="popup-header-workspace-section">
        <img className="product-logo" src="/resources/images/extended_logo.png" />
        {/* <Avatar shape="square" icon={<UserOutlined />} /> */}

        {/* <div className="popup-header-workspace-details">
          <Typography.Text strong>Personal’ workspace</Typography.Text>
          <Button
            type="link"
            target="_blank"
            className="popup-header-workspace-switch-btn"
            href={`${config.WEB_URL}/rules/my-rules?source=popup&workspace_switch=true`}
          >
            Switch
          </Button>
        </div> */}
      </div>

      <Row align="middle" gutter={16}>
        <Col>
          <Row align="middle">
            <Tooltip
              open={!isExtensionEnabled}
              title="Please switch on the Requestly extension. When paused, rules won't be applied and sessions won't be recorded."
              overlayClassName="enable-extension-tooltip"
            >
              <Switch
                checked={isExtensionEnabled}
                onChange={handleToggleExtensionStatus}
                size="small"
                className="pause-switch"
              />
            </Tooltip>
            <Typography.Text>{`Requestly ${isExtensionEnabled ? "running" : "paused"}`}</Typography.Text>
          </Row>
        </Col>
        <Col>
          <Button type="primary" className="open-app-btn" onClick={onOpenAppButtonClick}>
            Open app
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PopupHeader;
