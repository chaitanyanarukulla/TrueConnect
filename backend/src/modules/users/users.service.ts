import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../modules/users/dto/update-user.dto';
import { LoggingService } from '../../modules/logging/logging.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private loggingService: LoggingService,
  ) {
    this.loggingService.setContext('UsersService');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.loggingService.debug(`Creating new user`, 'create', { 
        email: createUserDto.email,
        name: createUserDto.name
      });
      
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);
      
      this.loggingService.log(`User created successfully`, 'create', { 
        userId: savedUser.id, 
        email: savedUser.email 
      });
      
      return savedUser;
    } catch (error) {
      this.loggingService.error(
        `Failed to create user: ${error.message}`,
        error.stack,
        'create'
      );
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.loggingService.debug(`Retrieving all users`, 'findAll');
      
      const users = await this.usersRepository.find();
      
      this.loggingService.debug(`Retrieved ${users.length} users`, 'findAll');
      
      return users;
    } catch (error) {
      this.loggingService.error(
        `Failed to retrieve users: ${error.message}`,
        error.stack,
        'findAll'
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User> {
    try {
      this.loggingService.debug(`Finding user by ID`, 'findById', { userId: id });
      
      const user = await this.usersRepository.findOne({ where: { id } });
      
      if (!user) {
        this.loggingService.warn(`User not found`, 'findById', { userId: id });
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      this.loggingService.debug(`User found`, 'findById', { userId: id });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Already logged
        throw error;
      }
      
      this.loggingService.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
        'findById'
      );
      throw error;
    }
  }

  /**
   * Efficiently check if a user exists by ID without retrieving the full entity
   * @param id User ID to check
   * @returns boolean indicating if user exists
   */
  async countById(id: string): Promise<boolean> {
    try {
      this.loggingService.debug(`Checking if user exists by ID`, 'countById', { userId: id });
      
      const count = await this.usersRepository.count({ where: { id } });
      const exists = count > 0;
      
      this.loggingService.debug(`User existence check result: ${exists}`, 'countById', { userId: id });
      return exists;
    } catch (error) {
      this.loggingService.error(
        `Error checking user existence by ID: ${error.message}`,
        error.stack,
        'countById'
      );
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.loggingService.debug(`Finding user by email`, 'findByEmail', { email });
      
      const user = await this.usersRepository.findOne({ where: { email } });
      
      if (user) {
        this.loggingService.debug(`User found by email`, 'findByEmail', { 
          email, 
          userId: user.id 
        });
      } else {
        this.loggingService.debug(`No user found with email`, 'findByEmail', { email });
      }
      
      return user;
    } catch (error) {
      this.loggingService.error(
        `Error finding user by email: ${error.message}`,
        error.stack,
        'findByEmail'
      );
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      this.loggingService.debug(`Updating user`, 'update', { 
        userId: id,
        fields: Object.keys(updateUserDto).join(', ')
      });
      
      const user = await this.findById(id);
      
      // Update user properties
      Object.assign(user, updateUserDto);
      
      // Save updated user
      const updatedUser = await this.usersRepository.save(user);
      
      this.loggingService.log(`User updated successfully`, 'update', { 
        userId: id, 
        fields: Object.keys(updateUserDto).join(', ') 
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Already logged
        throw error;
      }
      
      this.loggingService.error(
        `Failed to update user: ${error.message}`,
        error.stack,
        'update'
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      this.loggingService.debug(`Attempting to remove user`, 'remove', { userId: id });
      
      const result = await this.usersRepository.delete(id);
      
      if (result.affected === 0) {
        this.loggingService.warn(`User not found for removal`, 'remove', { userId: id });
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      this.loggingService.log(`User removed successfully`, 'remove', { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Already logged
        throw error;
      }
      
      this.loggingService.error(
        `Failed to remove user: ${error.message}`,
        error.stack,
        'remove'
      );
      throw error;
    }
  }

  // Helper method to remove sensitive information
  sanitizeUser(user: User): Partial<User> {
    const { password, ...result } = user;
    return result;
  }
}
