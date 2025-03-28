auth:

- đăng kí - confirm email
- đăng nhập
- forgot password - send mail
- reset password
- vv...

channel:

- create(userId, name, workspaceId) -> check auth of member to create channel in workspace -> only admin allow create - improve: cache member - validation: name and workspaceId

- update(userId,name,channelId) -> check auth -> change name of channel

- remove(userId,channelId) -> check auth -> delete all message in channel and delete channel

- getCurrentChannel(userId,workspaceId) ->

- getChannels(userId,workspaceId) -> check isMemberOfWorkspace -> get all channels

- getChannelById(userId, channelId) -> check userId -> check channelId exist -> check isMemberOfWorkspace

conversation:

- getById(userId,conversationId) -> get conversation

- createOrGet(userId, memberId, workspaceId) -> current member (userId) -> other member (memberId) -> check is conversation exist? yes -> get exst -> no -> create new

member:

- populateUser(userId) -> get user

- getMember(workspaceId, userId) -> get

- get(workspaceId, userId) -> get []

- getById(memberId, userId)

- current(workspaceId, userId)

- update(memberId, role: 'admin' | 'member', userId)

- remove(memberId: string, userId: string)

message:

- getMessageById(userId: string, messageId: string)

- getMessages(args: {
  userId: string;
  channelId?: string;
  parentMessageId?: string;
  conversationId?: string;
  pagination: { skip: number; take: number };
  })

- createMessage(args: {
  userId: string;
  workspaceId: string;
  body: string;
  channelId?: string;
  conversationId?: string;
  parentMessageId?: string;
  image?: string;
  })

- updateMessage(userId: string, messageId: string, body: string)

- deleteMessage(userId: string, messageId: string)

- aggregateReactions(reactions: any[])

- getConversationIdFromParent(parentMessageId?: string)

reaction:

- getMember(workspaceId: string, userId: string)

- toggleReaction(userId: string, messageId: string, value: string)

workspace:

- generateWorkspaceCode

- createWorkspace(userId: string, name: string)

- joinWorkspace(userId: string, workspaceId: string, joinCode: string)

- updateWorkspace(userId: string, workspaceId: string, name: string)

- deleteWorkspace(userId: string, workspaceId: string)

- checkAdminRole(userId: string, workspaceId: string)

- generateJoinCode()

users:

thanh toán:
Lưu ý quyền hạn: Phân quyền rõ ràng giữa Owner và Admin.
Tích hợp API thanh toán: Sử dụng Stripe, PayPal, hoặc hệ thống thanh toán khác để xử lý.
Tự động điều chỉnh: Hệ thống cần hỗ trợ tính toán tự động (thêm/xóa người dùng giữa chu kỳ).
Quản lý hóa đơn: Cho phép xuất hóa đơn PDF, theo dõi lịch sử thanh toán.

a. Free (Miễn phí)
Lưu trữ tin nhắn giới hạn (thường là 90 ngày hoặc 10,000 tin nhắn) -> gửi mail.
Hạn chế dung lượng file.
Không có tính năng gọi video nhóm hoặc tích hợp nâng cao.
b. Pro
Lưu trữ không giới hạn tin nhắn.
Cuộc gọi video nhóm.
Tích hợp với các ứng dụng như Google Drive, Salesforce.

Mô hình thanh toán
Slack sử dụng hai mô hình thanh toán chính:

a. Per Active User (Theo số người dùng hoạt động)
Người dùng trả phí dựa trên số lượng thành viên hoạt động trong workspace.
Nếu một thành viên không hoạt động trong một tháng, chi phí sẽ được tự động giảm cho tháng đó.
b. Annual Billing (Thanh toán hàng năm)
Người dùng có thể chọn trả trước cho cả năm để được giảm giá (thường giảm 15-20% so với thanh toán hàng tháng).

3.3. Nhắc đến (Mentions)
Sử dụng @username để nhắc đến một người dùng cụ thể.
@here và @channel để nhắc nhở tất cả thành viên trong kênh
