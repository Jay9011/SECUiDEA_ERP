package com.secuidea.visitreservekiosk.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun AccordionCard(
        title: String,
        content: @Composable () -> Unit,
        modifier: Modifier = Modifier,
        initiallyExpanded: Boolean = false
) {
    var expanded by remember { mutableStateOf(initiallyExpanded) }
    val rotationState by
            animateFloatAsState(targetValue = if (expanded) 180f else 0f, label = "rotation")

    Card(
            modifier = modifier,
            shape = RoundedCornerShape(8.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // 아코디언 헤더
            Surface(
                    modifier = Modifier.fillMaxWidth().clickable { expanded = !expanded },
                    color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                            text = title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                            Icons.Default.KeyboardArrowDown,
                            contentDescription = if (expanded) "접기" else "펼치기",
                            modifier = Modifier.rotate(rotationState)
                    )
                }
            }

            // 아코디언 내용
            AnimatedVisibility(
                    visible = expanded,
                    enter = expandVertically(),
                    exit = shrinkVertically()
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Spacer(modifier = Modifier.height(8.dp))
                    content()
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}
