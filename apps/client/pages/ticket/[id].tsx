import { Listbox, Switch, Transition } from "@headlessui/react";
import {
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronUpDownIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/20/solid";
import { Link, RichTextEditor } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import moment from "moment";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useQuery } from "react-query";
import renderHTML from "react-render-html";
// import TextAlign from '@tiptap/extension-text-align';
import { notifications } from "@mantine/notifications";
import { Button, DropdownMenu, Text, Tooltip } from "@radix-ui/themes";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { getCookie } from "cookies-next";
import useTranslation from "next-translate/useTranslation";
import { useUser } from "../../store/session";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Ticket() {
  const router = useRouter();
  const { t } = useTranslation("peppermint");

  const token = getCookie("session");

  const { user } = useUser();

  const fetchTicketById = async () => {
    const id = router.query.id;
    const res = await fetch(`/api/v1/ticket/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  };

  const { data, status, refetch } = useQuery("fetchTickets", fetchTicketById);

  useEffect(() => {
    refetch();
  }, [router]);

  const [edit, setEdit] = useState(false);
  const [editTime, setTimeEdit] = useState(false);
  const [assignedEdit, setAssignedEdit] = useState(false);
  const [labelEdit, setLabelEdit] = useState(false);

  const [users, setUsers] = useState<any>();
  const [n, setN] = useState<any>();

  const [note, setNote] = useState<any>();
  const [issue, setIssue] = useState<any>();
  const [title, setTitle] = useState<any>();
  const [uploaded, setUploaded] = useState<any>();
  const [priority, setPriority] = useState<any>();
  const [ticketStatus, setTicketStatus] = useState<any>();
  const [comment, setComment] = useState<any>();
  const [timeSpent, setTimeSpent] = useState<any>();
  const [publicComment, setPublicComment] = useState<any>(false);
  const [timeReason, setTimeReason] = useState("");

  const IssueEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      // TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: issue,
    onUpdate({ editor }) {
      setIssue(editor.getHTML());
    },
  });

  const history = useRouter();

  const { id } = history.query;

  let file: any = [];

  async function update() {
    await fetch(`/api/v1/ticket/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id,
        detail: issue,
        note,
        title,
        priority,
        status: ticketStatus,
      }),
    })
      .then((res) => res.json())
      .then(() => refetch());
  }

  async function updateStatus() {
    await fetch(`/api/v1/ticket/status/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: !data.ticket.isComplete,
        id,
      }),
    })
      .then((res) => res.json())
      .then(() => refetch());
  }

  async function hide(hidden) {
    await fetch(`/api/v1/ticket/status/hide`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        hidden,
        id,
      }),
    })
      .then((res) => res.json())
      .then(() => refetch());
  }

  async function addComment() {
    await fetch(`/api/v1/ticket/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        text: comment,
        id,
        public: publicComment,
      }),
    })
      .then((res) => res.json())
      .then(() => refetch());
  }

  async function addTime() {
    await fetch(`/api/v1/time/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        time: timeSpent,
        ticket: id,
        title: timeReason,
        user: user.id,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTimeEdit(false);
          refetch();
          notifications.show({
            title: "Time Added",
            message: "Time has been added to the ticket",
            color: "blue",
          });
        }
      });
  }

  // const propsUpload = {
  //   name: "file",
  //   showUploadList: false,
  //   action: `/api/v1/ticket/${id}/file/upload`,
  //   data: () => {
  //     let data = new FormData();
  //     data.append("file", file);
  //     data.append("filename", file.name);
  //     data.append("ticket", ticket.id);
  //   },
  //   onChange(info: any) {
  //     if (info.file.status !== "uploading") {
  //       console.log(info.file, info.fileList);
  //     }
  //     if (info.file.status === "done") {
  //       message.success(`${info.file.name} file uploaded successfully`);
  //       setUploaded(true);
  //     } else if (info.file.status === "error") {
  //       message.error(`${info.file.name} file upload failed.`);
  //     }
  //   },
  //   progress: {
  //     strokeColor: {
  //       "0%": "#108ee9",
  //       "100%": "#87d068",
  //     },
  //     strokeWidth: 3,
  //     format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
  //   },
  // };

  async function fetchUsers() {
    await fetch(`/api/v1/users/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) {
          setUsers(res.users);
        }
      });
  }

  async function transferTicket() {
    if (n !== undefined) {
      await fetch(`/api/v1/ticket/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: n.id,
          id,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setAssignedEdit(false);
            refetch();
          }
        });
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    transferTicket();
  }, [n]);

  useEffect(() => {
    if (status === "success") {
      if (IssueEditor) {
        IssueEditor.commands.setContent(data.ticket.detail);
      }
    }
  }, [data, IssueEditor]);

  return (
    <div>
      {status === "loading" && (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
          <h2> Loading data ... </h2>
          {/* <Spin /> */}
        </div>
      )}

      {status === "error" && (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold"> Error fetching data ... </h2>
          {/* <img src={server} className="h-96 w-96" alt="error" /> */}
        </div>
      )}

      {status === "success" && (
        <main className="flex-1 min-h-[90vh] py-8">
          <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row justify-center">
            <div className="xl:border-r xl:border-gray-200 xl:pr-8 xl:w-2/3">
              <div className="">
                <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6">
                  <div className="w-1/2">
                    {edit ? (
                      <div className="">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={title}
                          defaultValue={data.ticket.title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.ticket.title}
                      </h1>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-white">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {data.ticket.email}
                      </span>{" "}
                      via
                      <a
                        href="#"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {data.ticket.fromImap === true
                          ? " Email - "
                          : " Ticket Creation - "}
                      </a>
                      #{data.ticket.Number}
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-3 md:mt-0">
                    {!edit && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger className="hover:cursor-pointer">
                          <Button variant="outline">Options</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content className="min-w-[176px] mr-6">
                          <DropdownMenu.Item
                            className="min-w-[176px] capitalize hover:cursor-pointer"
                            onClick={() => setEdit(!edit)}
                          >
                            {!edit ? t("edit-btn") : "save"}
                          </DropdownMenu.Item>

                          {user.isAdmin && (
                            <DropdownMenu.Item
                              className="hover:cursor-pointer"
                              onClick={() => hide(!data.ticket.hidden)}
                            >
                              {data.ticket.hidden
                                ? "Show Global"
                                : "Hide Ticket"}
                            </DropdownMenu.Item>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    )}
                    {edit && (
                      <Button
                        className="hover:cursor-pointer"
                        variant="outline"
                        onClick={() => {
                          update();
                          setEdit(!edit);
                        }}
                      >
                        save
                      </Button>
                    )}
                    {user.isAdmin() && (
                      <button
                        type="button"
                        onClick={() => {
                          hide(!data.ticket.hidden);
                        }}
                        className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {data.ticket.hidden ? "Show Global" : "Hide Ticket"}
                      </button>
                    )}
                    {!edit ? (
                      <button
                        type="button"
                        onClick={() => setEdit(true)}
                        className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {t("edit-btn")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          update();
                          setEdit(false);
                        }}
                        className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {t("save")}
                      </button>
                    )}
                  </div>
                </div>
                <aside className="mt-4 xl:hidden">
                  <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 ">
                    {!data.ticket.isComplete ? (
                      <div className="flex items-center space-x-2">
                        <LockOpenIcon
                          className="h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-green-700 dark:text-white">
                          {t("open_issue")}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LockClosedIcon
                          className="h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-red-700 dark:text-white">
                          {t("closed_issue")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <ChatBubbleLeftEllipsisIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {data.ticket.comments.length} {t("comments")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Created on{" "}
                        {moment(data.ticket.createdAt).format("DD/MM/YYYY")}
                      </span>
                    </div>

                    {users && (
                      <Listbox value={n} onChange={setN}>
                        {({ open }) => (
                          <>
                            <div className="relative">
                              <Listbox.Button className="bg-white z-50 relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 px-4 py-1.5 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <span className="block min-w-[75px] text-xs">
                                  {data.ticket.assignedTo
                                    ? data.ticket.assignedTo.name
                                    : n
                                    ? n.name
                                    : t("select_new_user")}
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  {users.map((user: any) => (
                                    <Listbox.Option
                                      key={user.id}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "text-white bg-indigo-600"
                                            : "text-gray-900",
                                          "cursor-default select-none relative py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={user}
                                    >
                                      {({ n, active }: any) => (
                                        <>
                                          <span
                                            className={classNames(
                                              n
                                                ? "font-semibold"
                                                : "font-normal",
                                              "block truncate"
                                            )}
                                          >
                                            {user.name}
                                          </span>

                                          {n ? (
                                            <span
                                              className={classNames(
                                                active
                                                  ? "text-white"
                                                  : "text-indigo-600",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                    )}
                  </div>
                  <div className="py-3 border-b border-gray-200">
                    <div className="border-t border-gray-200">
                      <div className="flex flex-row items-center justify-between">
                        <span className="text-sm font-medium text-gray-500 mt-2">
                          {t("labels")}
                        </span>
                        <span className="text-sm font-medium text-gray-500 mt-2">
                          {t("edit-btn")}
                        </span>
                      </div>
                      <ul role="list" className="mt-2 leading-8 space-x-2">
                        {data.ticket.priority === "Low" && (
                          <li className="inline">
                            <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-blue-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                {data.ticket.priority} {t("priority")}
                              </div>
                            </div>
                          </li>
                        )}
                        {data.ticket.priority === "Normal" && (
                          <li className="inline">
                            <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-green-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                {data.ticket.priority} {t("priority")}
                              </div>
                            </div>
                          </li>
                        )}
                        {data.ticket.priority === "High" && (
                          <li className="inline">
                            <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                {data.ticket.priority} {t("priority")}
                              </div>
                            </div>
                          </li>
                        )}
                        {data.ticket.status && (
                          <li className="inline">
                            <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                              <div className="absolute flex flex-shrink-0 items-center justify-center">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="ml-3 text-xs font-semibold text-gray-900">
                                {data.ticket.status === "needs_support" && (
                                  <span>Needs Support</span>
                                )}
                                {data.ticket.status === "in_progress" && (
                                  <span>In Progress</span>
                                )}
                                {data.ticket.status === "in_review" && (
                                  <span>In Review</span>
                                )}
                                {data.ticket.status === "done" && (
                                  <span>Done</span>
                                )}
                              </div>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </aside>
                <div className="py-3 xl:pb-0 xl:pt-2">
                  <span className="text-sm font-bold">{t("description")}</span>
                  <div className="prose max-w-none">
                    {edit && !data.ticket.fromImap ? (
                      <RichTextEditor
                        editor={IssueEditor}
                        className="dark:bg-gray-900 dark:text-white rounded-none border-none"
                      >
                        <RichTextEditor.Toolbar className="dark:text-white rounded-none dark:bg-[#0A090C]">
                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ClearFormatting />
                            <RichTextEditor.Highlight />
                            <RichTextEditor.Code />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.H1 />
                            <RichTextEditor.H2 />
                            <RichTextEditor.H3 />
                            <RichTextEditor.H4 />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Blockquote />
                            <RichTextEditor.Hr />
                            <RichTextEditor.BulletList />
                            <RichTextEditor.OrderedList />
                            <RichTextEditor.Subscript />
                            <RichTextEditor.Superscript />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Link />
                            <RichTextEditor.Unlink />
                          </RichTextEditor.ControlsGroup>

                          <RichTextEditor.ControlsGroup>
                            <RichTextEditor.AlignLeft />
                            <RichTextEditor.AlignCenter />
                            <RichTextEditor.AlignJustify />
                            <RichTextEditor.AlignRight />
                          </RichTextEditor.ControlsGroup>
                        </RichTextEditor.Toolbar>

                        <RichTextEditor.Content className="dark:bg-[#0A090C] dark:text-white min-h-[50vh] rounded-none" />
                      </RichTextEditor>
                    ) : (
                      <div className="">
                        {data.ticket.fromImap ? (
                          <div className="break-words bg-white rounded-md p-4 text-black">
                            {renderHTML(data.ticket.detail)}
                          </div>
                        ) : (
                          <div className="">
                            {renderHTML(data.ticket.detail)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <section
                aria-labelledby="activity-title"
                className="mt-8 xl:mt-10"
              >
                <div>
                  <div className="divide-y divide-gray-200">
                    <div className="pb-2">
                      <span
                        id="activity-title"
                        className="text-lg font-medium text-gray-900 dark:text-white"
                      >
                        {t("comments")}
                      </span>
                    </div>
                    <div className="pt-2">
                      {/* Activity feed*/}
                      <div className="flow-root">
                        <ul role="list" className="-mb-8">
                          {data.ticket.comments.length > 0 &&
                            data.ticket.comments.map(
                              (item: any, itemIdx: any) => (
                                <li key={item.id}>
                                  <div className="relative pb-8">
                                    {itemIdx !==
                                    data.ticket.comments.length - 1 ? (
                                      <span
                                        className="absolute left-3 top-5 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                    <div className="relative flex items-start space-x-3">
                                      <div className="relative">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-500">
                                          <span className="font-medium leading-none text-xs text-white uppercase">
                                            {item.user.name[0]}
                                          </span>
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div>
                                          <div className="text-sm">
                                            <span className="font-medium text-gray-900 dark:text-white ">
                                              {item.user.name}
                                            </span>
                                          </div>
                                          <div className=" flex flex-row space-x-1">
                                            <span className="text-xs text-gray-500 dark:text-white">
                                              {item.public
                                                ? "Publicly"
                                                : "Internally"}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-white">
                                              commented at
                                            </span>

                                            <span className="text-xs text-gray-500 dark:text-white">
                                              {moment(item.createdAt).format(
                                                "DD/MM/YYYY hh:mm"
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-sm  text-gray-900 dark:text-white">
                                          <span>{item.text}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                      <div className="mt-6">
                        <div className="flex space-x-3">
                          <div className="min-w-0 flex-1">
                            <div>
                              <div>
                                <label htmlFor="comment" className="sr-only">
                                  {t("comment")}
                                </label>
                                <textarea
                                  id="comment"
                                  name="comment"
                                  rows={3}
                                  className="block w-full dark:bg-black rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                                  placeholder="Leave a comment"
                                  defaultValue={""}
                                  onChange={(e) => setComment(e.target.value)}
                                />
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Text as="label" size="2">
                                  <div className="flex flex-row items-center space-x-2">
                                    <Switch
                                      checked={publicComment}
                                      onChange={setPublicComment}
                                      className={`${
                                        publicComment
                                          ? "bg-blue-600"
                                          : "bg-gray-200"
                                      } relative inline-flex h-6 w-11 items-center rounded-full`}
                                    >
                                      <span className="sr-only">
                                        Enable notifications
                                      </span>
                                      <span
                                        className={`${
                                          publicComment
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                      />
                                    </Switch>
                                    <Tooltip content="Enabling this will mean the email registered to the ticket will get a reply based on your comment.">
                                      <Text> Public Reply</Text>
                                    </Tooltip>
                                  </div>
                                </Text>
                              </div>
                              <div className="mt-4 flex items-center justify-end space-x-4">
                                {data.ticket.isComplete ? (
                                  <button
                                    type="button"
                                    onClick={() => updateStatus()}
                                    className="inline-flex justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  >
                                    <CheckCircleIcon
                                      className="-ml-0.5 h-5 w-5 text-red-500"
                                      aria-hidden="true"
                                    />
                                    <span className="">
                                      {t("reopen_issue")}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => updateStatus()}
                                    className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  >
                                    <CheckCircleIcon
                                      className="-ml-0.5 h-5 w-5 text-green-500"
                                      aria-hidden="true"
                                    />
                                    {t("close_issue")}
                                  </button>
                                )}
                                <button
                                  onClick={() => addComment()}
                                  type="submit"
                                  className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                                >
                                  {t("comment")}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className="hidden xl:block xl:pl-8 xl:order-2 order-1">
              <h2 className="sr-only">{t("details")}</h2>
              <div className="space-y-5">
                {!data.ticket.isComplete ? (
                  <div className="flex items-center space-x-2">
                    <LockOpenIcon
                      className="h-5 w-5 text-green-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-green-700 dark:text-white">
                      {t("open_issue")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LockClosedIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-red-700 dark:text-white">
                      {t("closed_issue")}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <ChatBubbleLeftEllipsisIcon
                    className="h-5 w-5 text-gray-400 dark:text-white"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.ticket.comments.length} {t("comments")}
                  </span>
                </div>
                <div className="flex flex-row items-center space-x-2">
                  <CalendarIcon
                    className="h-5 w-5 text-gray-400 dark:text-white"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("created_at")}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {moment(data.ticket.createdAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>
              <div className="mt-2 space-y-8 border-t border-gray-200 py-2">
                <div>
                  <div className="flex flex-row justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-white">
                      {t("assignees")}
                    </span>
                    {!assignedEdit ? (
                      <button
                        onClick={() => setAssignedEdit(true)}
                        className="text-sm font-medium text-gray-500 hover:underline dark:text-white"
                      >
                        {t("edit-btn")}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          transferTicket();
                        }}
                        className="text-sm font-medium text-gray-500 hover:underline dark:text-white"
                      >
                        {t("save")}
                      </button>
                    )}
                  </div>
                  {!assignedEdit ? (
                    <ul role="list" className="mt-3 space-y-3">
                      <li className="flex justify-star items-center space-x-2">
                        <div className="flex-shrink-0">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-500">
                            <span className="text-xs font-medium leading-none text-white uppercase ">
                              {data.ticket.assignedTo
                                ? data.ticket.assignedTo.name[0]
                                : "-"}
                            </span>
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {data.ticket.assignedTo
                            ? data.ticket.assignedTo.name
                            : ""}
                        </div>
                      </li>
                    </ul>
                  ) : (
                    users && (
                      <Listbox value={n} onChange={setN}>
                        {({ open }) => (
                          <>
                            <div className="mt-1 relative">
                              <Listbox.Button className="bg-white z-50 relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                <span className="block truncate">
                                  {n ? n.name : t("select_new_user")}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"></span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  {users.map((user: any) => (
                                    <Listbox.Option
                                      key={user.id}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "text-white bg-indigo-600"
                                            : "text-gray-900",
                                          "cursor-default select-none relative py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={user}
                                    >
                                      {({ n, active }: any) => (
                                        <>
                                          <span
                                            className={classNames(
                                              n
                                                ? "font-semibold"
                                                : "font-normal",
                                              "block truncate"
                                            )}
                                          >
                                            {user.name}
                                          </span>

                                          {n ? (
                                            <span
                                              className={classNames(
                                                active
                                                  ? "text-white"
                                                  : "text-indigo-600",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                    )
                  )}
                </div>
                <div className="border-t border-gray-200">
                  <div className="flex flex-row items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-white">
                      {t("labels")}
                    </span>
                    {!labelEdit ? (
                      <button
                        onClick={() => setLabelEdit(true)}
                        className="text-sm font-medium text-gray-500 hover:underline"
                      >
                        {t("edit-btn")}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setLabelEdit(false);
                          update();
                        }}
                        className="text-sm font-medium text-gray-500 hover:underline"
                      >
                        {t("save")}
                      </button>
                    )}
                  </div>
                  {!labelEdit ? (
                    <ul role="list" className="mt-2 leading-8 space-x-2">
                      {data.ticket.priority === "Low" && (
                        <li className="inline">
                          <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <div className="absolute flex flex-shrink-0 items-center justify-center">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-blue-500"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-3 text-xs font-semibold text-gray-900 dark:text-white">
                              {data.ticket.priority} {t("priority")}
                            </div>
                          </div>
                        </li>
                      )}
                      {data.ticket.priority === "Normal" && (
                        <li className="inline">
                          <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <div className="absolute flex flex-shrink-0 items-center justify-center">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-green-500 "
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-3 text-xs font-semibold text-gray-900 dark:text-white">
                              {data.ticket.priority} {t("priority")}
                            </div>
                          </div>
                        </li>
                      )}
                      {data.ticket.priority === "High" && (
                        <li className="inline">
                          <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <div className="absolute flex flex-shrink-0 items-center justify-center">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-3 text-xs font-semibold text-gray-900 dark:text-white">
                              {data.ticket.priority} {t("priority")}
                            </div>
                          </div>
                        </li>
                      )}
                      {data.ticket.status && (
                        <li className="inline">
                          <div className="relative inline-flex items-center rounded-full px-2.5 py-1 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            <div className="absolute flex flex-shrink-0 items-center justify-center">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-rose-500"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="ml-3 text-xs font-semibold text-gray-900 dark:text-white">
                              {data.ticket.status === "needs_support" && (
                                <span>Needs Support</span>
                              )}
                              {data.ticket.status === "in_progress" && (
                                <span>In Progress</span>
                              )}
                              {data.ticket.status === "in_review" && (
                                <span>In Review</span>
                              )}
                              {data.ticket.status === "done" && (
                                <span>Done</span>
                              )}
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <>
                      <Listbox value={priority} onChange={setPriority}>
                        {({ open }) => (
                          <>
                            <div className="relative mt-2">
                              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                <span className="block truncate">
                                  {priority ? priority : data.ticket.priority}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="Low"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          Low
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="Normal"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          Normal
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="High"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          High
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      <Listbox value={ticketStatus} onChange={setTicketStatus}>
                        {({ open }) => (
                          <>
                            <div className="relative mt-2">
                              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                <div className="block truncate">
                                  {ticketStatus
                                    ? ticketStatus
                                    : data.ticket.status}
                                </div>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="needs_support"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          Needs Support
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="in_progress"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          In Progress
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="in_review"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          In Review
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                  <Listbox.Option
                                    className={({ active }) =>
                                      classNames(
                                        active
                                          ? "bg-indigo-600 text-white"
                                          : "text-gray-900",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value="done"
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span
                                          className={classNames(
                                            selected
                                              ? "font-semibold"
                                              : "font-normal",
                                            "block truncate"
                                          )}
                                        >
                                          Done
                                        </span>

                                        {selected ? (
                                          <span
                                            className={classNames(
                                              active
                                                ? "text-white"
                                                : "text-indigo-600",
                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                            )}
                                          >
                                            <CheckIcon
                                              className="h-5 w-5"
                                              aria-hidden="true"
                                            />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                    </>
                  )}
                </div>
                <div className="border-t border-gray-200">
                  <div className="flex flex-row items-center justify-between mt-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-white">
                      Time Tracking
                    </span>
                    {!editTime ? (
                      <button
                        onClick={() => setTimeEdit(true)}
                        className="text-sm font-medium text-gray-500 hover:underline dark:text-white"
                      >
                        add
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setTimeEdit(false);
                          addTime();
                        }}
                        className="text-sm font-medium text-gray-500 hover:underline dark:text-white"
                      >
                        save
                      </button>
                    )}
                  </div>
                  {data.ticket.TimeTracking.length > 0 ? (
                    data.ticket.TimeTracking.map((i: any) => (
                      <div key={i.id} className="text-xs">
                        <div className="flex flex-row space-x-1.5 items-center dark:text-white">
                          <span>{i.user.name} / </span>
                          <span>{i.time} minutes</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>
                      <span className="text-xs dark:text-white">
                        No Time added
                      </span>
                    </div>
                  )}
                  {editTime && (
                    <div>
                      <div className="mt-2 flex flex-col space-y-2">
                        <input
                          type="text"
                          name="text"
                          id="timespent_text"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="What did you do?"
                          value={timeReason}
                          onChange={(e) => setTimeReason(e.target.value)}
                        />
                        <input
                          type="number"
                          name="number"
                          id="timespent"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="Time in minutes"
                          value={timeSpent}
                          onChange={(e) => setTimeSpent(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
