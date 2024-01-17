import React, { useState } from "react";
import { Avatar, Col, Drawer, Dropdown, Popconfirm, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { OrgMembersTable } from "features/settings/components/OrgMembersTable";
import { MemberTableActions } from "./components/MemberTableActions";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { MdPersonOutline } from "@react-icons/all-files/md/MdPersonOutline";
import type { MenuProps } from "antd";
import "./index.scss";
import { getBillingTeamMembers } from "store/features/billing/selectors";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import { removeMemberFromBillingTeam, updateBillingTeamMemberRole } from "backend/billing";
import { toast } from "utils/Toast";

export const BillingTeamMembers: React.FC = () => {
  const { billingId } = useParams();

  const user = useSelector(getUserAuthDetails);
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const membersTableSource = billingTeamMembers ? Object.values(billingTeamMembers) : [];
  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  const columns = [
    {
      title: "Member",
      key: "id",
      render: (_: any, record: Record<string, any>) => (
        <Row>
          <div className="mr-8">
            <Avatar size={28} shape="circle" src={record.photoUrl} alt={record.displayName} />
          </div>
          <div>
            <div className="text-bold">{`${record.displayName} ${record.role}`}</div>
            <div>
              <span className="member-email">{record.email}</span>
            </div>
          </div>
        </Row>
      ),
    },
    {
      title: "Added on",
      dataIndex: "joiningDate",
      render: (joiningDate: number) => (
        <>{new Date(joiningDate).toLocaleString("default", { month: "short", day: "numeric", year: "numeric" })}</>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_: any, record: any) => {
        if (!isUserAdmin || record.id === user?.details?.profile?.uid) return null;
        return (
          <Row justify="end" align="middle" gutter={8} className="w-full">
            <Col>
              <Popconfirm
                title="Do you really want to remove this user from the billing team?"
                onConfirm={() => {
                  removeMemberFromBillingTeam(billingId, record.id)
                    .then((res) => {
                      console.log("!!!debug", "success", res.data);
                      toast.success("User removed from the billing team");
                    })
                    .catch((err) => {
                      console.log("!!!debug", "removing error", err);
                      toast.error("Error while removing user");
                    });
                }}
                okText="Confirm"
                cancelText="Cancel"
              >
                <RQButton
                  type="text"
                  icon={<IoMdCloseCircleOutline fontSize={14} />}
                  className="remove-member-btn"
                  disabled={!isUserAdmin}
                >
                  Remove
                </RQButton>
              </Popconfirm>
            </Col>
            <Col>
              <Dropdown
                menu={{
                  items: items.map((item) => ({ ...item, disabled: item.key === record.role })),
                  onClick: ({ key }) => {
                    updateBillingTeamMemberRole(billingId, record.id, key as BillingTeamRoles)
                      .then(() => {
                        toast.success(`User role changed to ${key}`);
                      })
                      .catch((err) => {
                        toast.error("Error while changing user role");
                      });
                  },
                }}
                trigger={["click"]}
                disabled={!isUserAdmin}
              >
                <RQButton
                  className="members-table-dropdown-btn"
                  icon={<HiOutlineDotsHorizontal />}
                  iconOnly
                  type="text"
                />
              </Dropdown>
            </Col>
          </Row>
        );
      },
    },
  ];

  const items: MenuProps["items"] = [
    {
      key: BillingTeamRoles.Admin,
      label: (
        <Row align="middle" gutter={8}>
          <MdOutlineAdminPanelSettings fontSize={16} className="mr-8" />
          Make Admin
        </Row>
      ),
    },
    {
      key: BillingTeamRoles.Member,
      label: (
        <Row align="middle" gutter={8}>
          <MdPersonOutline fontSize={16} className="mr-8" />
          Change role to member
        </Row>
      ),
    },
  ];

  return (
    <>
      <Col className="billing-teams-primary-card billing-team-members-section">
        <Row className="billing-team-members-section-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-section-header-title">Members in billing team</Col>
          <Col>
            <RQButton
              type="default"
              icon={<IoMdAdd />}
              className="billing-team-members-section-header-btn"
              onClick={() => setIsMembersDrawerOpen(true)}
              disabled={!isUserAdmin}
            >
              Add members
            </RQButton>
          </Col>
        </Row>
        <Table
          className="billing-table my-billing-team-members-table"
          dataSource={membersTableSource}
          columns={columns}
          pagination={false}
          scroll={{ y: "35vh" }}
        />
      </Col>
      <Drawer
        placement="right"
        onClose={() => setIsMembersDrawerOpen(false)}
        open={isMembersDrawerOpen}
        width={640}
        closeIcon={null}
        mask={false}
        className="billing-team-members-drawer"
      >
        <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-drawer-header_title">Add members in billing team</Col>
          <Col>
            <IoMdClose onClick={() => setIsMembersDrawerOpen(false)} />
          </Col>
        </Row>
        <Col className="billing-team-members-drawer-body">
          <OrgMembersTable actionButtons={(record: any) => <MemberTableActions record={record} />} />
        </Col>
        <Row className="mt-8 billing-team-members-drawer-help" justify="space-between" align="middle">
          <Col>
            Couldn't find member?{" "}
            <a className="external-link" href="mailto:contact@requestly.io">
              Contact us
            </a>
            , and we'll assist you in adding your team members.
          </Col>
          <Col>
            <RQButton type="primary" onClick={() => setIsMembersDrawerOpen(false)}>
              Done
            </RQButton>
          </Col>
        </Row>
      </Drawer>
    </>
  );
};