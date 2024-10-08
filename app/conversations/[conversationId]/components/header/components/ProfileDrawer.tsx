"use client";

import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/AvatarGroup";
import Modal from "@/app/components/Modal";
import useActiveUser from "@/app/hooks/useActiveUser";
import useOtherUser from "@/app/hooks/useOtherUser";
import { FullConversationType } from "@/app/types";
import { Conversation, User } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FC, useMemo, useState } from "react";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { IoTrash } from "react-icons/io5";

interface ConversationInfoDrawerProps {
  conversation: Conversation & {
    users: User[];
  };
}

const ConversationInfoDrawer: FC<ConversationInfoDrawerProps> = ({
  conversation,
}) => {
  const session = useSession();
  const otherUser = useOtherUser(conversation);

  const otherUserIsActive = useActiveUser(otherUser);

  const router = useRouter();

  const [modal, setModal] = useState({ opened: false, loading: false });

  const { name, status } = useMemo(() => {
    const { users, isGroup, name: groupName } = conversation;
    const name = isGroup ? groupName : otherUser?.name;

    const otherUserStatus = otherUserIsActive ? "Active" : "Offline";

    const status = isGroup ? `${users.length} members` : otherUserStatus;

    return { name, status };
  }, [conversation, otherUser?.name, otherUserIsActive]);

  const handleDelete = async () => {
    setModal({ ...modal, loading: true });
    try {
      await axios.delete(`/api/conversations/${conversation.id}`);

      router.push("/conversations");
    } catch (error) {
      console.log(error);
    } finally {
      setModal({ opened: false, loading: false });
    }
  };

  const groupMembers = useMemo(() => {
    return conversation.users.filter(
      ({ email }) => email !== session.data?.user?.email
    );
  }, [conversation.users, session.data?.user?.email]);

  return (
    <div>
      <div className="drawer drawer-end z-50">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label htmlFor="my-drawer-4" className="drawer-button ">
            <HiEllipsisHorizontal
              size={32}
              className="transition cursor-pointer drawer-button"
            />
          </label>
        </div>
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-4"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <div className="bg-base-200 text-base-content min-h-full w-80 p-4 bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
            {/* Sidebar content here */}
            <div className="flex flex-col items-center">
              <div className="mb-2">
                {conversation.isGroup ? (
                  <AvatarGroup users={conversation.users} />
                ) : (
                  <Avatar user={otherUser} />
                )}{" "}
              </div>
              <p>{name}</p>
              <div className="text-sm">{status}</div>
              <div className="flex flex-col gap-3 my-8">
                <button
                  className="btn btn-circle"
                  onClick={() => setModal({ opened: true, loading: false })}
                >
                  <IoTrash size={20} />
                </button>
                <div>Delete</div>
              </div>
            </div>
            <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
              <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                {!conversation.isGroup && (
                  <>
                    <div>
                      <dt className="text-sm font-medium sm:w-40 sm:flex-shrink-0">
                        Email
                      </dt>
                      <dt className="mt-1 text-sm sm:col-span-2">
                        {otherUser?.email}
                      </dt>
                    </div>
                    <div>
                      <dt className="text-sm font-medium sm:w-40 sm:flex-shrink-0">
                        Joined
                      </dt>
                      <dt className="mt-1 text-sm sm:col-span-2">
                        {format(
                          otherUser?.createdAt || new Date(),
                          "MM/dd/yyyy"
                        )}
                      </dt>
                    </div>
                  </>
                )}
                {conversation.isGroup && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium sm:w-40 sm:flex-shrink-0">
                      Members
                    </p>
                    {React.Children.toArray(
                      groupMembers.map((user) => (
                        <div className="flex flex-row items-center gap-x-3">
                          <Avatar user={user} />
                          <div className="flex flex-col w-full">
                            <div className="flex flex-row justify-between items-center flex-1">
                              <p className="text-base font-medium">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
      <Modal
        opened={modal.opened}
        onClose={() => setModal({ opened: false, loading: false })}
        action={
          <>
            <button onClick={() => setModal({ opened: false, loading: false })}>
              Cancel
            </button>
            <button
              className="btn btn-outline"
              onClick={handleDelete}
              disabled={modal.loading}
            >
              Delete
            </button>
          </>
        }
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone"
      />
    </div>
  );
};

export default ConversationInfoDrawer;
