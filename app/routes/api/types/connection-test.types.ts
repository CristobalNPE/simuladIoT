export type ConnectionTestStatus = 'success' | 'warning' | 'error';

export type TestConnectionResult = {
    status: ConnectionTestStatus;
    message: string;
};