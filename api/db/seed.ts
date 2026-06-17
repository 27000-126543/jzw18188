import { nanoid } from "nanoid";
import { store } from "./store";
import type {
  User,
  Lead,
  Communication,
  StageHistory,
  Customer,
  SalesTarget,
  Notification,
  LeadStage,
  LeadSource,
  CommunicationType,
} from "../../shared/types";
import { COOLING_THRESHOLD_DAYS, STAGE_ORDER } from "../../shared/types";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const hoursAgo = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
};

function seedUsers() {
  store.users = [
    {
      id: "u1",
      name: "张伟",
      email: "zhangwei@example.com",
      role: "sales",
    },
    {
      id: "u2",
      name: "李娜",
      email: "lina@example.com",
      role: "sales",
    },
    {
      id: "u3",
      name: "王磊",
      email: "wanglei@example.com",
      role: "sales",
    },
    {
      id: "u4",
      name: "陈敏",
      email: "chenmin@example.com",
      role: "manager",
    },
  ];
}

function generateLeads(): Lead[] {
  const companies = [
    "星辰科技有限公司",
    "蓝海数字传媒",
    "云翼网络服务",
    "绿洲环保科技",
    "金鹰国际贸易",
    "锐思咨询顾问",
    "华瑞医疗器械",
    "鼎盛建筑工程",
    "新视野广告",
    "智联软件",
    "卓越教育集团",
    "锦绣餐饮连锁",
    "恒通物流",
    "博远地产",
    "雅集文化传播",
    "正泰电气",
    "汇通金融",
    "开元汽车",
    "美景旅游",
    "润泽食品",
  ];

  const contacts = [
    "刘建国", "赵晓芳", "孙明辉", "周美玲", "吴志强",
    "郑雅琴", "冯志远", "黄丽娟", "何鹏飞", "罗婉清",
    "梁俊峰", "谢红梅", "唐浩然", "韩雪梅", "曹立新",
    "邓淑芬", "许文杰", "傅丽萍", "沈德昌", "曾慧敏",
  ];

  const titles = [
    "采购总监", "市场经理", "技术负责人", "运营总监", "副总裁",
    "CTO", "CEO", "行政主管", "销售总监", "财务经理",
  ];

  const sources: LeadSource[] = ["website", "expo", "referral"];
  const stages: LeadStage[] = ["initial", "needs", "proposal", "negotiation", "won", "lost"];
  const owners = ["u1", "u2", "u3"];

  const leads: Lead[] = [];

  for (let i = 0; i < 20; i++) {
    const createdDays = Math.floor(Math.random() * 45) + 1;
    const lastFollowDays = Math.floor(Math.random() * 15);
    const isCooling = lastFollowDays > COOLING_THRESHOLD_DAYS;
    const stage = stages[i % stages.length];
    const owner = owners[i % owners.length];

    leads.push({
      id: `l${i + 1}`,
      companyName: companies[i],
      contactName: contacts[i],
      contactTitle: titles[i % titles.length],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`,
      email: `contact${i + 1}@company${i + 1}.com`,
      address: `上海市浦东新区世纪大道${100 + i}号`,
      source: sources[i % sources.length],
      stage,
      ownerId: owner,
      estimatedValue: Math.floor(Math.random() * 900000) + 100000,
      isCooling,
      coolingDays: isCooling ? lastFollowDays : 0,
      createdAt: daysAgo(createdDays),
      updatedAt: daysAgo(Math.min(lastFollowDays, createdDays)),
      lastFollowUpAt: lastFollowDays > 0 ? daysAgo(lastFollowDays) : undefined,
    });
  }
  return leads;
}

function generateCommunications(leads: Lead[]): Communication[] {
  const types: CommunicationType[] = ["phone", "email", "visit"];
  const users = ["u1", "u2", "u3"];
  const contents = [
    "初次电话沟通，客户表示对我们的产品有兴趣，约定下周发详细资料。",
    "发送产品报价单及公司介绍邮件，等待客户反馈。",
    "客户来访公司，参观了产品演示室，对产品性能满意。",
    "电话跟进需求确认，客户希望增加定制化功能。",
    "上门拜访，与技术团队讨论方案细节，客户提出修改意见。",
    "邮件发送修改后的方案，客户正在内部评估。",
    "谈判会议，就价格和交付周期进行协商，客户希望有10%折扣。",
    "电话沟通合同条款，客户法务正在审核。",
    "客户确认方案，准备进入合同签署阶段。",
    "由于预算原因，客户暂时搁置项目，保持后续联系。",
  ];

  const comms: Communication[] = [];

  leads.forEach((lead) => {
    const count = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < count; j++) {
      const createdHours = Math.floor(Math.random() * 24 * 20);
      comms.push({
        id: `c${lead.id}-${j}`,
        leadId: lead.id,
        type: types[j % types.length],
        content: contents[(j + lead.id.charCodeAt(1)) % contents.length],
        createdBy: users[j % users.length],
        createdAt: hoursAgo(createdHours),
      });
    }
  });

  return comms;
}

function generateStageHistory(leads: Lead[]): StageHistory[] {
  const history: StageHistory[] = [];

  leads.forEach((lead) => {
    const currentIdx = STAGE_ORDER.indexOf(lead.stage);
    const createdDate = new Date(lead.createdAt);

    for (let i = 0; i <= currentIdx; i++) {
      const stage = STAGE_ORDER[i];
      const enteredAt = new Date(createdDate);
      enteredAt.setDate(enteredAt.getDate() + i * (2 + Math.floor(Math.random() * 5)));

      const leftAt =
        i < currentIdx
          ? (() => {
              const left = new Date(enteredAt);
              left.setDate(left.getDate() + 2 + Math.floor(Math.random() * 8));
              return left;
            })()
          : undefined;

      const durationDays = leftAt
        ? Math.ceil(
            (leftAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)
          )
        : undefined;

      history.push({
        id: `sh-${lead.id}-${i}`,
        leadId: lead.id,
        stage,
        enteredAt: enteredAt.toISOString(),
        leftAt: leftAt?.toISOString(),
        durationDays,
      });
    }
  });

  return history;
}

function generateCustomers(leads: Lead[]): Customer[] {
  return leads
    .filter((l) => l.stage === "won")
    .map((l) => ({
      id: `cust-${l.id}`,
      leadId: l.id,
      companyName: l.companyName,
      contactName: l.contactName,
      phone: l.phone,
      email: l.email,
      address: l.address,
      dealValue: l.estimatedValue,
      closedAt: daysAgo(Math.floor(Math.random() * 20) + 1),
      createdAt: daysAgo(Math.floor(Math.random() * 20) + 1),
    }));
}

function generateSalesTargets(): SalesTarget[] {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return [
    {
      id: "t1",
      userId: "u1",
      month,
      targetAmount: 1500000,
      targetCount: 5,
      achievedAmount: 980000,
      achievedCount: 3,
    },
    {
      id: "t2",
      userId: "u2",
      month,
      targetAmount: 1200000,
      targetCount: 4,
      achievedAmount: 760000,
      achievedCount: 2,
    },
    {
      id: "t3",
      userId: "u3",
      month,
      targetAmount: 1000000,
      targetCount: 4,
      achievedAmount: 1250000,
      achievedCount: 5,
    },
  ];
}

function generateNotifications(): Notification[] {
  return [
    {
      id: "n1",
      userId: "u4",
      type: "cooling",
      title: "线索冷却提醒",
      content: "星辰科技有限公司已超过10天未跟进，请及时联系。",
      relatedLeadId: "l1",
      read: false,
      createdAt: hoursAgo(2),
    },
    {
      id: "n2",
      userId: "u4",
      type: "stage_change",
      title: "线索阶段推进",
      content: "绿洲环保科技已从「方案报价」推进至「谈判」阶段。",
      relatedLeadId: "l4",
      read: false,
      createdAt: hoursAgo(6),
    },
    {
      id: "n3",
      userId: "u4",
      type: "lost",
      title: "线索流失提醒",
      content: "美景旅游标记为流失，请关注团队跟进情况。",
      relatedLeadId: "l19",
      read: true,
      createdAt: daysAgo(1),
    },
    {
      id: "n4",
      userId: "u1",
      type: "cooling",
      title: "线索冷却提醒",
      content: "博远地产已超过8天未跟进。",
      relatedLeadId: "l14",
      read: false,
      createdAt: hoursAgo(4),
    },
  ];
}

export function seedDatabase() {
  seedUsers();
  store.leads = generateLeads();
  store.communications = generateCommunications(store.leads);
  store.stageHistory = generateStageHistory(store.leads);
  store.customers = generateCustomers(store.leads);
  store.salesTargets = generateSalesTargets();
  store.notifications = generateNotifications();
}

export { nanoid };
