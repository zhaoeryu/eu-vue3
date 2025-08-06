import { type BaseEntity } from '@/types/api'

export interface Jobs extends BaseEntity {
  id: string;
  jobName: string;
  jobGroup: string;
  cron: string;
  status: number;
  misfirePolicy: number;
  concurrent: number;
  invokeClassName?: string;
  springBeanName?: string;
  methodName?: string;
  methodParams?: string;
  pauseAfterFailure: boolean;
  alarmEmail?: string;
}

export interface JobLog extends BaseEntity {
  id: string;
  jobId: string;
  jobName: string;
  invokeClassName?: string;
  springBeanName?: string;
  methodName?: string;
  methodParams?: string;
  success: boolean;
  exceptionMessage?: string;
  exceptionDetail?: string;
  startTime: string;
  endTime: string;
  execTime: number;
}
