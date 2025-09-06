import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { GroupEntity } from './group.entity';
import { MessageEntity } from './message.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar'})
  username: string;

  @Column({ nullable: true, type: 'varchar'})
  socketId: string;

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'inactive';

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => GroupEntity, group => group.users)
  @JoinTable({
    name: 'user_groups',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' }
  })
  groups: GroupEntity[];

  @OneToMany(() => MessageEntity, message => message.user, { cascade: true })
  messages: MessageEntity[];
}
