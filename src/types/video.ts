// 视频数据类型
export interface Video {
  id: string;
  title: string;
  coverUrl: string;
  duration: string; // 视频时长，如 "45:20"
  expert: {
    name: string;
    title: string;
    department: string;
  };
  tags: string[];
  views: number;
  isAnalyzed: boolean; // AI是否已解析
  analyzeTime?: string; // 解析时间
}

// 模拟视频数据
export const mockVideos: Video[] = [
  {
    id: '1',
    title: '复杂腹腔镜下全胃切除术',
    coverUrl: 'https://spark-builder.s3.cn-north-1.amazonaws.com.cn/image/2026/3/19/604318db-d0a5-426d-a073-0f7f05870f06.png',
    duration: '110:15',
    expert: {
      name: '李国强',
      title: '教授',
      department: '胃肠外科',
    },
    tags: ['胃切除'],
    views: 890,
    isAnalyzed: true,
    analyzeTime: '2026年3月15日',
  },
  {
    id: '2',
    title: '单孔胸腔镜肺叶切除术及淋巴结清扫策略',
    coverUrl: 'https://spark-builder.s3.cn-north-1.amazonaws.com.cn/image/2026/3/19/688bbb42-67a8-463e-aeaf-83b67dd4627e.png',
    duration: '45:20',
    expert: {
      name: '陈建华',
      title: '教授',
      department: '胸外科',
    },
    tags: ['肺叶切除'],
    views: 1300,
    isAnalyzed: true,
    analyzeTime: '2026年3月10日',
  },
  {
    id: '3',
    title: '达芬奇机器人辅助前列腺癌根治术',
    coverUrl: 'https://spark-builder.s3.cn-north-1.amazonaws.com.cn/image/2026/3/19/61c6374f-e56d-47b7-b1bd-12d6fe1db29f.png',
    duration: '155:00',
    expert: {
      name: '张炜',
      title: '教授',
      department: '泌尿外科',
    },
    tags: ['达芬奇手术'],
    views: 2100,
    isAnalyzed: true,
    analyzeTime: '2026年3月18日',
  },
];

// 统计卡片数据
export interface VideoStats {
  totalVideos: number;
  analyzedCount: number;
  expertCount: number;
}

export const mockVideoStats: VideoStats = {
  totalVideos: 3,
  analyzedCount: 3,
  expertCount: 3,
};

// 关键节点数据
export interface VideoKeyNode {
  id: string;
  time: string; // 时间点，如 "02:15"
  title: string;
  description: string;
}

export const mockKeyNodes: VideoKeyNode[] = [
  {
    id: '1',
    time: '02:15',
    title: '游离肺门结构',
    description: '解剖肺门，暴露出肺动脉干及分支。',
  },
  {
    id: '2',
    time: '12:40',
    title: '支气管离断',
    description: '使用切割缝合器进行支气管处理的技巧。',
  },
  {
    id: '3',
    time: '25:10',
    title: '纵隔淋巴结清扫',
    description: '重点演示第7组及第10组淋巴结的清扫过程。',
  },
];

// 引用来源
export interface Citation {
  id: string;
  title: string;
  authors?: string;
  type: 'GUIDELINE' | 'PDF';
  year?: string;
  journal?: string;
}

export const mockCitations: Citation[] = [
  {
    id: '1',
    title: '2024年非小细胞肺癌纵隔淋巴结清扫专家共识',
    authors: '中华医学会胸外科学分会',
    type: 'GUIDELINE',
    year: '2024',
    journal: '胸部肿瘤杂志',
  },
  {
    id: '2',
    title: '解剖性肺段切除术在早期肺癌治疗中的应用进展',
    authors: '张三, 张晓',
    type: 'PDF',
    year: '2025',
    journal: '中华外科杂志',
  },
];