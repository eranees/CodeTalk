import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { GroupEntity } from './group.entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'text'})
  message: string;

  @Column({type: 'varchar'})
  username: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({type: 'varchar'})
  groupCode: string;

  @ManyToOne(() => UserEntity, user => user.messages)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => GroupEntity, group => group.messages)
  @JoinColumn({ name: 'groupId' })
  group: GroupEntity;
}
