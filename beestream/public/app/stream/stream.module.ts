import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StreamRoutes } from './stream.routes';
import { StreamComponent } from './stream.component';
import { VideoService } from '../video/video.service';
import { CommentModule } from '../comment/comment.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    CommentModule,
    RouterModule.forChild(StreamRoutes)
  ],
  declarations: [
    StreamComponent
  ],
  providers: [
    VideoService
  ]
})
export class StreamModule {}
