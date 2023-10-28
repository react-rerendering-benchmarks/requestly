import React, { useCallback, useEffect, useMemo } from "react";
import { LockOutlined } from "@ant-design/icons";
import { MdExpandMore } from "@react-icons/all-files/md/MdExpandMore";
import { Avatar, Dropdown, Row, Typography, Col } from "antd";
import { RQButton } from "lib/design-system/components";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import APP_CONSTANTS from "config/constants";
import { getUniqueColorForWorkspace } from "utils/teams";
import "./index.scss";

const getWorkspaceIcon = (workspaceName: string) => {
  if (workspaceName === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE) return <LockOutlined />;
  return workspaceName ? workspaceName[0].toUpperCase() : "?";
};

export const UpgradeWorkspaceMenu: React.FC<{
  workspaceToUpgrade: { name: string; id: string; accessCount: number };
  setWorkspaceToUpgrade: (workspaceDetails: any) => void;
  className?: string;
}> = ({ workspaceToUpgrade, setWorkspaceToUpgrade, className }) => {
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);

  const filteredAvailableTeams = useMemo(() => {
    return (
      availableTeams?.filter(
        (team: any) => !team?.archived && team.members?.[user?.details?.profile?.uid]?.role === "admin"
      ) ?? []
    );
  }, [availableTeams, user?.details?.profile?.uid]);

  const populateWorkspaceDetails = useCallback(
    (workspaceId: string) => {
      return filteredAvailableTeams.find((team: any) => team.id === workspaceId);
    },
    [filteredAvailableTeams]
  );

  useEffect(() => {
    if (currentlyActiveWorkspace?.id) {
      setWorkspaceToUpgrade(populateWorkspaceDetails(currentlyActiveWorkspace?.id));
    }
  }, [currentlyActiveWorkspace?.id, populateWorkspaceDetails, setWorkspaceToUpgrade]);

  const workspaceMenuItems = {
    items: [
      {
        key: "private_workspace",
        label: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE)}
            className="workspace-avatar"
            style={{ backgroundColor: "#1E69FF" }}
          />
        ),
      },
      ...filteredAvailableTeams.map((team: any) => ({
        label: team.name,
        key: team.id,
        icon: (
          <Avatar
            size={18}
            shape="square"
            icon={getWorkspaceIcon(team.name)}
            className="workspace-avatar"
            style={{
              backgroundColor: getUniqueColorForWorkspace(team?.id, team.name),
            }}
          />
        ),
      })),
    ],
    onClick: ({ key: teamId }: { key: string }) => {
      if (teamId === "private_workspace") {
        return setWorkspaceToUpgrade({
          name: APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE,
          id: "private_workspace",
          accessCount: 1,
        });
      }
      setWorkspaceToUpgrade(populateWorkspaceDetails(teamId));
    },
  };

  return user.loggedIn ? (
    <Row className={`upgrade-workspace-selector-container ${className ?? ""}`}>
      <Col className="upgrade-workspace-selector-dropdown-container">
        Select workspace to upgrade
        <Dropdown menu={workspaceMenuItems} trigger={["click"]} overlayClassName="upgrade-workspace-selector-dropdown">
          <RQButton className="upgrade-workspace-selector-dropdown-btn">
            <Row className="cursor-pointer items-center">
              <Avatar
                size={28}
                shape="square"
                icon={getWorkspaceIcon(
                  workspaceToUpgrade?.name ?? APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                )}
                className="workspace-avatar"
                style={{
                  backgroundColor:
                    !workspaceToUpgrade ||
                    workspaceToUpgrade?.name === APP_CONSTANTS.TEAM_WORKSPACES.NAMES.PRIVATE_WORKSPACE
                      ? "#1E69FF"
                      : getUniqueColorForWorkspace(workspaceToUpgrade?.id, workspaceToUpgrade?.name),
                }}
              />
              <Col className="upgrade-workspace-dropdown-btn-info">
                <Typography.Text className="workspace-name">{workspaceToUpgrade?.name}</Typography.Text>
                <Typography.Text className="workspace-members">
                  {workspaceToUpgrade?.accessCount} active {workspaceToUpgrade?.accessCount > 1 ? "members" : "member"}
                </Typography.Text>
              </Col>
              <MdExpandMore className="upgrade-workspace-selector-dropdown-icon" />
            </Row>
          </RQButton>
        </Dropdown>
      </Col>
    </Row>
  ) : null;
};