import { useEffect, useMemo, useState } from "react";
import { Collapse } from "antd";
import { CreditsProgressBar } from "../CreditsProgressbar/CreditsProgessbar";
import { IncentiveSectionHeader } from "../IncentiveSectionHeader";
import { PiCaretDownBold } from "@react-icons/all-files/pi/PiCaretDownBold";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TaskHeader } from "./components/TaskHeader/TaskHeader";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Milestones, UserMilestoneDetails } from "features/incentivization/types";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import { MdPlaylistAdd } from "@react-icons/all-files/md/MdPlaylistAdd";
import { MdOutlineDiversity1 } from "@react-icons/all-files/md/MdOutlineDiversity1";
import { MdOutlineDns } from "@react-icons/all-files/md/MdOutlineDns";
import { PiRecordFill } from "@react-icons/all-files/pi/PiRecordFill";
import { MdOutlineStarBorder } from "@react-icons/all-files/md/MdOutlineStarBorder";
import { NewRuleButtonWithDropdown } from "features/rules/screens/rulesList/components/RulesList/components";
import { Button } from "antd";
import { redirectToMocks, redirectToSessionRecordingHome } from "utils/RedirectionUtils";
import { actions } from "store";
import { IncentivizeEvent } from "features/incentivization/types";
import { IncentiveTaskListItem } from "./types";
import { incentivizationActions } from "store/features/incentivization/slice";
import {
  getIncentivizationMilestones,
  getIncentivizationUserMilestoneDetails,
} from "store/features/incentivization/selectors";
import { getTotalCredits, isTaskCompleted } from "features/incentivization/utils";
import "./incentiveTasksList.scss";

/**
 * - fetch userMilestone details and update the progress bar [DONE]
 * - fix complete state of the tasks [DONE]
 * - dissble actions for completed task [DONE]
 * - trigger rule creation action
 *    - when success, show congratulation modal with proper message else error message
 * - trigger rest of the events from their corresponding actions and show the congrats modal
 * - fix rate us on chrome store link
 * - fix task list copies
 * - fix navigations
 * - deploy it on beta
 * - give it for review
 * - find out all the touch points for incentiviation checklist [VVVVV.IMP]
 *   - put them behind feature flag
 *   - also put them behind new user check
 */

export const IncentiveTasksList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const milestones = useSelector(getIncentivizationMilestones);
  const userMilestoneDetails: UserMilestoneDetails = useSelector(getIncentivizationUserMilestoneDetails);

  const totalCredits = useMemo(() => getTotalCredits(milestones), [milestones]);

  useEffect(() => {
    const getMilestones = httpsCallable(getFunctions(), "incentivization-getMilestones");

    setIsLoading(true);
    getMilestones()
      .then((res) => {
        const milestones = (res?.data as { milestones: Milestones })?.milestones;
        dispatch(incentivizationActions.setMilestones({ milestones }));
      })
      .catch(() => {
        // do nothing
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch]);

  // TODO: handle disable actions
  const incentiveTasksList: IncentiveTaskListItem[] = useMemo(
    () => [
      {
        id: IncentivizeEvent.FIRST_RULE_CREATED,
        title: "Create your first rule",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails),
        description:
          "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 Free credits for professional plan.",
        icon: <MdPlaylistAdd />,
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_RULE_CREATED, userMilestoneDetails);
          return <NewRuleButtonWithDropdown disable={isCompleted} />;
        },
        helpLink: <a href="#">Learn how to create Rules</a>,
        milestone: milestones?.[IncentivizeEvent.FIRST_RULE_CREATED],
      },
      {
        id: IncentivizeEvent.PREMIUM_RULE_CREATED,
        title: "Create other rules",
        isCompleted: isTaskCompleted(IncentivizeEvent.PREMIUM_RULE_CREATED, userMilestoneDetails),
        description:
          "Use rules to intercept & modify network requests, headers, API requests, inject scripts & much more. Upon creating your first rule you will earn $25 Free credits for professional plan.",
        icon: <MdPlaylistAdd />,
        action: () => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.PREMIUM_RULE_CREATED, userMilestoneDetails);
          return <NewRuleButtonWithDropdown disable={isCompleted} />;
        },
        helpLink: <a href="#">Learn how to create Rules</a>,
        milestone: milestones?.[IncentivizeEvent.PREMIUM_RULE_CREATED],
      },
      {
        id: IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED,
        title: "Create a Team Workspace",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED, userMilestoneDetails),
        description:
          "Team Workspaces let you share your debugging workflows with your teammates in real time. Everyone can collaborate on things like Rules, Mock APIs and Session replays.",
        icon: <MdOutlineDiversity1 />,
        action: ({ dispatch }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED, userMilestoneDetails);

          return (
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() =>
                dispatch(
                  // @ts-ignore
                  actions.toggleActiveModal({
                    modalName: "createWorkspaceModal",
                    newValue: true,
                    newProps: {
                      callback: () => {
                        // @ts-ignore
                        dispatch(actions.updateJoinWorkspaceCardVisible(false));
                      },
                      source: "join_workspace_card",
                    },
                  })
                )
              }
            >
              Create a new workspace
            </Button>
          );
        },
        helpLink: <a href="#">Learn how to create Team Workspace</a>,
        milestone: milestones?.[IncentivizeEvent.FIRST_TEAM_WORKSPACE_CREATED],
      },
      {
        id: IncentivizeEvent.FIRST_MOCK_CREATED,
        title: "Create an API Mock",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_MOCK_CREATED, userMilestoneDetails),
        description: "Create mocks for your APIs with different status codes, delay, response headers or body",
        icon: <MdOutlineDns />,
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_MOCK_CREATED, userMilestoneDetails);

          return (
            <Button disabled={isCompleted} type="primary" onClick={() => redirectToMocks(navigate)}>
              Create a mock API
            </Button>
          );
        },

        helpLink: <a href="#">Learn how to create API Mock</a>,
        milestone: milestones?.[IncentivizeEvent.FIRST_MOCK_CREATED],
      },
      {
        id: IncentivizeEvent.FIRST_SESSION_RECORDED,
        title: "Record a session",
        isCompleted: isTaskCompleted(IncentivizeEvent.FIRST_SESSION_RECORDED, userMilestoneDetails),
        description:
          "Session replays allows you to capture, report, and debug errors with the power of session replay and network & console logs.",
        icon: <PiRecordFill />,
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.FIRST_SESSION_RECORDED, userMilestoneDetails);

          return (
            <Button disabled={isCompleted} type="primary" onClick={() => redirectToSessionRecordingHome(navigate)}>
              Record a session
            </Button>
          );
        },
        helpLink: <a href="#">Learn how to record a session</a>,
        milestone: milestones?.[IncentivizeEvent.FIRST_SESSION_RECORDED],
      },
      {
        id: IncentivizeEvent.RATE_ON_CHROME_STORE,
        title: "Rate us on Chrome Store",
        isCompleted: isTaskCompleted(IncentivizeEvent.RATE_ON_CHROME_STORE, userMilestoneDetails),
        description: "Give a rating on chrome store.",
        icon: <MdOutlineStarBorder />,
        action: ({ navigate }) => {
          const isCompleted = isTaskCompleted(IncentivizeEvent.RATE_ON_CHROME_STORE, userMilestoneDetails);

          return (
            <Button
              disabled={isCompleted}
              type="primary"
              onClick={() => {
                // navigate to chrome store page
                // just call claim rewards after 30 sec
              }}
            >
              Rate now
            </Button>
          );
        },
        milestone: milestones?.[IncentivizeEvent.RATE_ON_CHROME_STORE],
      },
    ],
    [milestones, userMilestoneDetails]
  );

  return (
    <div className="incentive-tasks-list-container">
      <IncentiveSectionHeader title={`Complete onboarding and earn $${totalCredits} Free credits`} />
      <div className="mt-24">
        <CreditsProgressBar />
      </div>
      <div className="incentive-tasks-list">
        {isLoading ? (
          <div className="loader">
            <Loading3QuartersOutlined spin />
          </div>
        ) : (
          <Collapse
            className="incentive-tasks-list-collapse"
            expandIconPosition="end"
            expandIcon={({ isActive }) => (
              <div className="collapse-arrow-container">
                <PiCaretDownBold className={`collapse-arrow-down ${isActive ? "rotate" : ""}`} />
              </div>
            )}
          >
            {incentiveTasksList.map((task, index) => (
              <Collapse.Panel header={<TaskHeader task={task} />} key={index}>
                <div className="incentive-task-content">
                  {task.description ? <div className="incentive-task-description">{task.description}</div> : null}

                  <div className="incentive-task-actions">
                    {task.action({
                      dispatch,
                      navigate,
                    })}
                    {task?.helpLink ? <div className="incentive-task-help-link">{task?.helpLink}</div> : null}
                  </div>
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </div>
    </div>
  );
};